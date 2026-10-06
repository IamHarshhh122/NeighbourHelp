const User = require("../model/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpStorage = new Map();
const signupTempStorage = new Map();

const normalizeEmail = (email) => (email ? email.toLowerCase().trim() : "");

const formatUser = (user) => ({
  _id: user._id,
  id: user._id,
  fullname: user.name,
  name: user.name,
  email: user.email,
  points: user.points ?? 20,
  homeAddress: user.homeAddress || "",
  homeLat: user.homeLat ?? null,
  homeLng: user.homeLng ?? null,
});

const sendVerificationEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"NeighbourHelp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your NeighbourHelp verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
        <div style="max-width:480px;margin:auto;background:#ffffff;padding:28px;border-radius:16px;text-align:center">
          <h2 style="color:#0f172a;margin:0 0 20px">
            Neighbour<span style="color:#2563eb">Help</span>
          </h2>

          <h3 style="color:#0f172a;margin-bottom:8px">
            Verify your email
          </h3>

          <p style="color:#64748b;font-size:14px">
            Use the verification code below to continue.
          </p>

          <div style="padding:20px;background:#eff6ff;border-radius:12px;margin:20px 0">
            <div style="font-size:11px;color:#64748b;margin-bottom:8px">
              VERIFICATION CODE
            </div>

            <div style="font-size:30px;font-weight:bold;color:#2563eb;letter-spacing:6px">
              ${otp}
            </div>
          </div>

          <p style="color:#64748b;font-size:12px">
            This code expires in 5 minutes.
          </p>

          <p style="color:#94a3b8;font-size:11px;margin-top:20px">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  });
};

exports.sendOtp = async (req, res) => {
  try {
    const { email, fullname, password } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address!",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (fullname && password) {
      if (fullname.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Please enter your full name!",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters!",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account already exists with this email. Please login.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      signupTempStorage.set(normalizedEmail, {
        fullname: fullname.trim(),
        password: hashedPassword,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStorage.set(normalizedEmail, {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendVerificationEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully!",
    });
  } catch (error) {
    console.error("OTP Send Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.code === "EAUTH"
          ? "Email service authentication failed. Check EMAIL_USER and EMAIL_PASS."
          : "Failed to send verification email!",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required!",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const storedOtp = otpStorage.get(normalizedEmail);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new code!",
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStorage.delete(normalizedEmail);
      signupTempStorage.delete(normalizedEmail);

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new code!",
      });
    }

    if (storedOtp.code !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Incorrect verification code!",
      });
    }

    otpStorage.delete(normalizedEmail);

    let user = await User.findOne({
      email: normalizedEmail,
    });

    const tempData = signupTempStorage.get(normalizedEmail);

    if (tempData) {
      if (Date.now() > tempData.expiresAt) {
        signupTempStorage.delete(normalizedEmail);

        return res.status(400).json({
          success: false,
          message: "Signup session expired. Please request a new OTP!",
        });
      }

      if (user) {
        signupTempStorage.delete(normalizedEmail);

        return res.status(400).json({
          success: false,
          message: "An account already exists with this email. Please login.",
        });
      }

      user = await User.create({
        email: normalizedEmail,
        name: tempData.fullname,
        password: tempData.password,
        points: 20,
      });

      signupTempStorage.delete(normalizedEmail);

      return res.status(200).json({
        success: true,
        message: "Account created successfully!",
        user: formatUser(user),
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email. Please sign up first.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying OTP!",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password!",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email. Please sign up first!",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account does not have a password. Please continue with Google or use OTP login.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login!",
    });
  }
};

// ================= SAVE HOME LOCATION =================
exports.saveHomeLocation = async (req, res) => {
  try {
    const { email, homeAddress, homeLat, homeLng } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const updatedUser = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        homeAddress: homeAddress || "",
        homeLat: homeLat ?? null,
        homeLng: homeLng ?? null,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Home location saved successfully!",
      user: formatUser(updatedUser),
    });
  } catch (error) {
    console.error("Save Home Location Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving location!",
    });
  }
};