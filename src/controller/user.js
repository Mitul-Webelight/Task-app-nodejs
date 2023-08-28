const User = require('../models/user');
const bcrypt = require('bcrypt');
const {
  success_200,
  success_201,
  error_400,
  error_401,
  error_500,
  success_upload,
  error_imageFileUpload,
} = require('../util/messages');
const sharp = require('sharp');
const multer = require('multer');
const { sendWelcomEmail } = require('../emails/account');
const { successRes, errorRes } = require('../util/response');
require('dotenv').config();

const hashedPassword = async (password) => {
  const hashed = await bcrypt.hash(password, 10);
  return hashed;
};

const userAdd = async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return errorRes(res, 400, error_400);
    }

    const hashed = await hashedPassword(password);

    const user = new User({
      name,
      email,
      password: hashed,
      age,
    });

    sendWelcomEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    await user.save();
    successRes(res, { user, token }, 201, success_201);
  } catch (error) {
    console.error(error);
    errorRes(res, 500, error_500);
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return errorRes(res, 401, error_401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return errorRes(res, 401, error_401);
    }

    const token = await user.generateAuthToken();

    successRes(res, { user, token }, 200, success_200);
  } catch (error) {
    console.error(error);
    errorRes(res, 500, error_500);
  }
};

const userLogout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
};

const userLogoutAll = async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
};

const allUsersList = async (req, res) => {
  try {
    const users = await User.find();

    successRes(res, { users }, 200, success_200);
  } catch (error) {
    console.error(error);
    errorRes(res, 500, error_500);
  }
};

const userById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorRes(res, 400, error_400);
    }
    successRes(res, { user }, 200, success_200);
  } catch (error) {
    console.error(error);
    errorRes(res, 500, error_500);
  }
};

const userUpdate = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorRes(res, 400, error_400);
    }

    const { name, email, password, age } = req.body;

    const hashed = await hashedPassword(password);

    if (name && email && password && age) {
      user.name = name;
      user.email = email;
      user.password = hashed;
      user.age = age;
    }

    await user.save();

    successRes(res, { user }, 200, success_200);
  } catch (error) {
    console.error(error);
    errorRes(res, 500, error_500);
  }
};

const userDelete = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return errorRes(res, 400, error_400);
    }

    successRes(res, { user }, 200, success_200);
  } catch (error) {
    console.error(error);
    errorRes(res, 500, error_500);
  }
};

const upload = multer(
  {
    limits: {
      fieldSize: 100000000,
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error(error_imageFileUpload));
      }

      cb(undefined, true);
    },
  },
  (error, res, req, next) => {
    console.log(error);
    errorRes(res, 400, error_400);
  }
);

const uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 300, height: 300 })
      .png()
      .toBuffer();
    if (!user) {
      return errorRes(res, 400, error_400);
    }

    user.avatar = buffer;
    await user.save();
    successRes(res, { user }, 200, success_upload);
  } catch (error) {
    console.log(error);
    errorRes(res, 500, error_500);
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorRes(res, 400, error_400);
    }
    user.avatar = undefined;
    await user.save();
    successRes(res, { user }, 200, success_200);
  } catch (error) {
    console.log(error);
    errorRes(res, 500, error_500);
  }
};

const getUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      return errorRes(res, 400, error_400);
    }
    res.set('Content-Type', 'image/jpeg');
    successRes(res, user.avatar, 200, success_200);
  } catch (error) {
    console.error(error);
    errorRes(res, 500, error_500);
  }
};

module.exports = {
  userAdd,
  userLogin,
  userLogout,
  userLogoutAll,
  allUsersList,
  userById,
  userUpdate,
  userDelete,
  uploadAvatar,
  deleteAvatar,
  getUserAvatar,
  upload,
};
