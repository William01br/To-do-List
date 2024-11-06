import express from "express";
const router = express.Router();

// get page login
router.get("/login", (req, res) => {
  res.render("login", { erro: req.query.erro });
});

export default router;
