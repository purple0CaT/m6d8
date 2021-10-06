export const regError = (err, req, res, next) => {
  if (err.status >= 400 || err.status < 500) {
    res.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
};

export const generError = (err, req, res, next) => {
  res.status(500).send({ message: "Generic server Error!" });
};
