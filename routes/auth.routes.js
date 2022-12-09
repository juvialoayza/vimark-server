const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

//rutas de autenticación (signup y login)

// POST "/api/auth/signup" => recibir la info del formulario y crear el perfil en la BD
router.post("/signup", async (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body;

  // todos los campos deben estar llenos
  if (
    firstName === "" ||
    lastName === "" ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    res.status(400).json({errorMessage:"Rellena todos los campos"})
    return;
  }

  //validar la fuerza de la contraseña
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (passwordRegex.test(password) === false) {
    res.status(406).json({errorMessage: "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número",
    })
    return;
  }

  try {
    //validación para que el usuario y el email sean únicos
    const foundUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (foundUser !== null) {
        res.status(302).json({errorMessage: "Este usuario o email ya existen"});
      return;
    }

    // elemento de seguridad
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // crear perfil del usuario
    const newUser = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: hashPassword,

      //   photoUser: photoUser
    };

    await User.create(newUser);
    res.status(201).json("Usuario registrado")
  } catch (err) {
    next(err);
  }
});


//POST "/api/auth/login" => validación del usuario y acceso
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (username === "" || password === "") {
    res.status(400).json({errorMessage: "Rellena todos los campos"});
    return;
  }

  try {
    // verificar el usuario
    const foundUser = await User.findOne({ username: username });
    if (foundUser === null) {
        res.status(400).json({errorMessage: "Usuario o contraseña incorrecto"});
      return;
    }

    // verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (isPasswordValid === false) {
        res.status(400).json({errorMessage: "Usuario o contraseña incorrecto"});
      return;
    }

    //2. creación de sesión (TOKEN) y enviarlo al cliente
    const payload = {
        _id: foundUser._id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        username: foundUser.username,
        email: foundUser.email,
    }

    const authToken = jwt.sign(
        payload,
        process.env.TOKEN_SECRET,
        { algorithm: "HS256", expiresIn: "6h" }
    )
    res.status(200).json({ authToken: authToken })
  } catch (err) {
    next(err);
  }
});

//GET "api/auth/verify" => 
router.get("/verify", isAuthenticated, (req, res, next) => {
    console.log(req.payload)
    res.status(200).json({ user: req.payload })
})

module.exports = router;