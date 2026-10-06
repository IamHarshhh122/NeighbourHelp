const User = require("../model/User");
const bcrypt = require("bcryptjs");

const otpStorage = {};
const signupTempStorage = {};

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

// SEND OTP 
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStorage[normalizedEmail] = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    if (fullname && password) {
      signupTempStorage[normalizedEmail] = { fullname, password };
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial">
  <div style="max-width:480px;margin:auto;background:white;padding:25px;border-radius:16px;text-align:center">
    <h2 style="color:#0f172a">Neighbour<span style="color:#2563eb">Help</span></h2>
    <h3>Verify your email</h3>
    <p style="color:#64748b">Use the verification code below.</p>
    <div style="padding:20px;background:#eff6ff;border-radius:12px">
      <div style="font-size:11px;color:#64748b">VERIFICATION CODE</div>
      <div style="font-size:30px;font-weight:bold;color:#2563eb;letter-spacing:6px">${otp}</div>
    </div>
    <p style="color:#64748b;font-size:12px">This code expires in 5 minutes.</p>
  </div>
</body>
</html>
    `;

    // Direct REST API Call (Zero dependency, 100% reliable)
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "NeighbourHelp",
          email: process.env.EMAIL_USER,
        },
        to: [{ email: normalizedEmail }],
        subject: `${otp} is your NeighbourHelp verification code`,
        htmlContent: emailHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API Response Error:", data);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email via provider!",
      });
    }

    console.log("Email sent successfully via Brevo:", data);

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully!",
    });
  } catch (error) {
    console.error("Brevo OTP Send Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification email!",
    });
  }
};

// VERIFY OTP 
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
    const storedOtp = otpStorage[normalizedEmail];

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new code!",
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      delete otpStorage[normalizedEmail];
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

    delete otpStorage[normalizedEmail];

    let user = await User.findOne({ email: normalizedEmail });
    const tempData = signupTempStorage[normalizedEmail] || {};
    let hashedPassword = null;

    if (tempData.password) {
      hashedPassword = await bcrypt.hash(tempData.password, 10);
    }

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: tempData.fullname || normalizedEmail.split("@")[0],
        password: hashedPassword,
      });
    } else {
      if (!user.password && hashedPassword) {
        user.password = hashedPassword;
        if (tempData.fullname && (!user.name || user.name === normalizedEmail.split("@")[0])) {
          user.name = tempData.fullname;
        }
        await user.save();
      }
    }

    delete signupTempStorage[normalizedEmail];

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
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

// LOGIN 
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
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email. Please sign up first!",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google Login. Please continue with Google.",
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

// SAVE HOME LOCATION 
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
      { homeAddress, homeLat, homeLng },
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