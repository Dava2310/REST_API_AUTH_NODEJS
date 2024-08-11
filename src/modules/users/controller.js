import db from "../../DB/mysql.js";
import responds from '../../red/responds.js';

const viewUser = async (req, res) => {
    try {

        // Getting user after authentication with JWT
        const user = await db.findOneRecord('users', {id: req.user.id});
    
        if (!user) {
            responds.error(req, res, {message: 'Problem with getting user. Try again'}, 401)
        }
    
        // Returning data from this current user
        const data = {
            id: user.id, 
            name: user.name,
            email: user.email,
            role: user.role
        }
    
        responds.success(req, res, {data}, 200);
    
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const onlyAdmin = async (req, res) => {

    return res.status(200).json({ message: 'Hello admin' })

}

const onlyAdminModerator = async (req, res) => {

    return res.status(200).json({ message: 'Hello admin or moderator' })

}

export default {viewUser, onlyAdmin, onlyAdminModerator}

