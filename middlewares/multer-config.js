import multer,{diskStorage} from "multer";
import {join,dirname} from "path";
import { fileURLToPath } from "url";
//les extensions a accepter
const MIME_TYPES={
    "image/jpg":"jpg",
    "image/jpeg":"jpg",
    "image/png":"png"

};

export default multer({
    //configuration de stockage
    storage:diskStorage({
        //configuration de l'emplacement de stockage
        destination:(req,file,callback)=>{
            const __dirname=dirname(fileURLToPath(import.meta.url));//recuperer le chemin du dossier courant
            callback(null,join(__dirname,"../public/images")); // indiquer l'emplacement de stockage
        },
//configurer le nom avec lequel le fichier va etre entregistrer
        filename:(req,file,callback)=>{
            //remplacer les espaces par les underscores
            const name=file.originalname.split("").join("_");
            //recuperer l'extension a utiliser pour le fichier
            const extension=MIME_TYPES[file.mimetype];
            //ajoouter un timestamp date.now() au nom de fichier
            callback(null,name+Date.now()+"."+extension)
        },
    }),
//tail max des images 10Mo
    limits:10*1024*1024,
}).single("image");//le  fichier est envoyé dans le body avec nom/clé 'image'