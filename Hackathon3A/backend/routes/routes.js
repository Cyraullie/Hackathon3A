const{Router} = require ('express')
const router = Router()
const{connexion,info} = require('../controllers/ctrl')

router.post('/info', info)
// router.get('/connexion',connexion)
module.exports=router