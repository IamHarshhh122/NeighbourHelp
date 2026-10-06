let User = require("../model/User");
if (User.User) User = User.User; // Safety check if exported as an object

let Otp = require("../model/Otp");
if (Otp.Otp) Otp = Otp.Otp;

const bcrypt = require("bcryptjs");

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

// Sleek Dark-themed Email HTML
const getEmailHtml = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NeighbourHelp Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <tr>
            <td style="padding: 35px 35px 20px 35px; text-align: center; border-bottom: 1px solid #1f2937;">
              <div style="display: inline-block; padding: 8px 18px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 50px; margin-bottom: 12px;">
                <span style="color: #60a5fa; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">COMMUNITY NETWORK</span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #f9fafb; letter-spacing: -0.5px;">
                Neighbour<span style="color: #38bdf8;">Help</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 35px 20px 35px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #f3f4f6;">Verify Your Account</h2>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #9ca3af;">
                Welcome to NeighbourHelp! Use the 6-digit verification code below to complete your registration.
              </p>
              
              <div style="margin: 28px 0; padding: 22px 15px; background: #0f172a; border: 1px dashed #38bdf8; border-radius: 14px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">ONE-TIME PASSWORD</div>
                <div style="font-size: 36px; font-weight: 800; color: #38bdf8; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
              </div>

              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                ⏱ This code will expire in <strong style="color: #9ca3af;">10 minutes</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 35px 30px 35px; text-align: center; border-top: 1px solid #1f2937;">
              <p style="margin: 0; font-size: 11px; color: #4b5563; line-height: 18px;">
                If you did not request this code, you can safely ignore this email.<br>
                &copy; 2026 NeighbourHelp Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Brevo REST API Sender
const sendVerificationEmail = async (email, otp) => {
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
      to: [{ email }],
      subject: `Your NeighbourHelp Verification Code is ${otp}`,
      htmlContent: getEmailHtml(otp),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Brevo API Error:", data);
    throw new Error(data.message || "Failed to send email via Brevo API");
  }
  return data;
};

// ================= SEND OTP =================
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

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "An account already exists with this email. Please login.",
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Remove any previous active OTP from MongoDB
    await Otp.deleteMany({ email: normalizedEmail });

    // Store in MongoDB (Persists across Render restarts)
    await Otp.create({
      email: normalizedEmail,
      code: otp,
      fullname: fullname ? fullname.trim() : "",
      password: hashedPassword || "",
    });

    console.log(`[OTP Stored in DB] Email: ${normalizedEmail} | OTP: ${otp}`);

    await sendVerificationEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully!",
    });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send verification email!",
    });
  }
};

// ================= VERIFY OTP =================
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
    const cleanOtp = String(otp).trim();

    // Fetch from MongoDB
    const storedOtp = await Otp.findOne({ email: normalizedEmail });

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new code!",
      });
    }

    if (storedOtp.code !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Incorrect verification code!",
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (storedOtp.password) {
      if (user) {
        await Otp.deleteMany({ email: normalizedEmail });
        return res.status(400).json({
          success: false,
          message: "An account already exists with this email. Please login.",
        });
      }

      user = await User.create({
        email: normalizedEmail,
        name: storedOtp.fullname || normalizedEmail.split("@")[0],
        password: storedOtp.password,
        points: 20,
      });

      await Otp.deleteMany({ email: normalizedEmail });

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

    await Otp.deleteMany({ email: normalizedEmail });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while verifying OTP!",
    });
  }
};

// ================= LOGIN =================
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
        message: "This account does not have a password. Please continue with Google or use OTP login.",
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