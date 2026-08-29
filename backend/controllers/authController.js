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

const otpStorage = {}; 
const signupTempStorage = {}; 

exports.sendOtp = async (req, res) => {
    try {
        const { email, fullname, password } = req.body; 

        if (!email || !email.includes("@")) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address!" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        otpStorage[normalizedEmail] = {
            code: otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        };

        if (fullname && password) {
            signupTempStorage[normalizedEmail] = { fullname, password };
        }

        const mailOptions = {
            from: `"NeighbourHelp" <${process.env.EMAIL_USER}>`,
            to: normalizedEmail,
            subject: `${otp} is your NeighbourHelp verification code`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeighbourHelp Verification</title>
</head>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:Arial,Helvetica,sans-serif;">
    <div style="width:100%; padding:20px 10px; box-sizing:border-box; background:#f1f5f9;">
        <div style="max-width:100%; width:480px; margin:0 auto; background:#ffffff; border-radius:16px; padding:24px 20px; box-sizing:border-box; box-shadow:0 10px 25px rgba(15,23,42,0.06);">
            
            <div style="text-align:center; margin-bottom:20px;">
                <div style="width:44px; height:44px; line-height:44px; margin:0 auto 10px; border-radius:12px; background:#2563eb; color:#ffffff; font-size:20px; font-weight:bold;">
                    N
                </div>
                <div style="font-size:20px; font-weight:800; color:#0f172a;">
                    Neighbour<span style="color:#2563eb;">Help</span>
                </div>
            </div>

            <h2 style="margin:0 0 8px; color:#0f172a; font-size:20px; font-weight:700; text-align:center;">
                Verify your email
            </h2>

            <p style="margin:0 0 20px; color:#64748b; font-size:13px; line-height:1.5; text-align:center;">
                Use the verification code below to complete your NeighbourHelp account setup.
            </p>

            <div style="margin:20px 0; padding:18px 10px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; text-align:center;">
                <div style="margin-bottom:6px; color:#64748b; font-size:10px; font-weight:bold; letter-spacing:1.5px; text-transform:uppercase;">
                    Verification Code
                </div>
                <div style="color:#2563eb; font-size:30px; font-weight:800; letter-spacing:6px;">
                    ${otp}
                </div>
            </div>

            <p style="margin:0; color:#475569; font-size:12px; line-height:1.5; text-align:center;">
                This code expires in <strong>5 minutes</strong>.
            </p>

            <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0; text-align:center;">
                <p style="margin:0; color:#94a3b8; font-size:11px;">
                    © 2026 NeighbourHelp
                </p>
            </div>

        </div>
    </div>
</body>
</html>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Verification code sent successfully!",
        });

    } catch (error) {
        console.error("OTP Send Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send verification email!",
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body; 

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required!" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const storedOtp = otpStorage[normalizedEmail]; 
        if (!storedOtp) {
            return res.status(400).json({ success: false, message: "OTP not found or expired. Please request a new code!" });
        }

        if (Date.now() > storedOtp.expiresAt) {
            delete otpStorage[normalizedEmail];
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new code!" });
        }

      
        if (storedOtp.code !== otp) {
            return res.status(400).json({ success: false, message: "Incorrect verification code!" });
        }

        
        delete otpStorage[normalizedEmail];

       
        let user = await User.findOne({ email: normalizedEmail });
        const tempData = signupTempStorage[normalizedEmail] || {};
        let hashedPassword;

        if (tempData.password) {
            hashedPassword = await bcrypt.hash(tempData.password, 10);
        }

        if (!user) {
            user = await User.create({
                email: normalizedEmail,
                name: tempData.fullname || normalizedEmail.split("@")[0],
                password: hashedPassword || null,
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
            user: {
                id: user._id,
                fullname: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({ success: false, message: "Server error while verifying OTP!" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; 
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password!" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }); 
        if (!user) {
            return res.status(400).json({ success: false, message: "No account found with this email. Please sign up first!" });
        }
        if (!user.password) {
            return res.status(400).json({ success: false, message: "This account uses Google Login. Please continue with Google." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password!" });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            user: {
                id: user._id,
                fullname: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Server error during login!" });
    }
};