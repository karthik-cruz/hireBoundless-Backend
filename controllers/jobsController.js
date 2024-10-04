const usersModel = require('../models/usersSchema');
const jobsModel = require('../models/jobsShema');
const companyModel = require('../models/companiesSchema');


const postJob = async (req, res) => {
    try {
        const { title, description, postedBy, salary, company, experience, skills, qualification, location, address, jobType } = req.body;
        console.log(title, description, postedBy, salary, company, experience, skills, qualification, location, address, jobType)

        if (!company) {
            return res.status(201).json({ message: 'Company not found', success: false });
        }
        //check if the company already exists -------
        const existingCompany = await companyModel.findById({ _id: company });
        if (!existingCompany) {     
            return res.status(201).json({ message: 'Company not found', success: false });
        }

        const newJob = new jobsModel({ title, company, postedBy, salary, address, description, company, experience, skills, qualification, location, jobType });
        await newJob.save();
        res.status(200).json({ message: 'Job posted successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error posting job', error });
    }
}



module.exports = {
    postJob
}