import express from 'express';
import mongoose from "mongoose";
import { errorHandler, notFoundError } from './middlewares/error-handler.js';
import morgan from 'morgan';
import cors from "cors";

import userRoutes from './routes/user.js';

const app=express();
const port=process.env.PORT || 3000;
const databaseName = "bizos";
// cela affichera les requetes mongodb dans le terminal
mongoose.set("debug", true);
mongoose.Promise = global.Promise;
//se connecter a MongoDB
const dbURI = 'mongodb+srv://Mirou:amir169114@cluster0.48u3p.mongodb.net/bizos?retryWrites=true&w=majority';
mongoose

  .connect(dbURI)
  .then(() => {
    //une fois connecté ,afficher un message de réussite sur la console
    console.log(`connected to ${databaseName}`);
  })
  .catch((err) => {
    //si quelque chose ne va pas , afficher l'erreur sur la console
    console.log(err);
  });


app.use(cors());//Cross Origin Resource Sharing(yaati l'acces localhost:3000).
//The :status token will be colored green for success codes, red for server error codes, yellow for client error codes
app.use(morgan("dev"));//utiliser morgan
app.use(express.json());//pour analyser app/json
app.use(express.urlencoded({ extended: true }));//pour analyser app/x-www-foem-urlencoded
app.use("/img",express.static("public/images"));//servir les fichiers sous le dossier public/image
app.use('/user',userRoutes);//préfixe chaque route ici avec /user
//utiliser le middleware gestionnaire d'erreurs
app.use(notFoundError);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
