// payrollController.js
const Payroll = require('../models/Payroll');

exports.createPayroll = (req, res) => {
    const newPayroll = new Payroll(req.body);
    newPayroll.save()
        .then(payroll => res.status(201).json(payroll))
        .catch(err => res.status(400).json({ error: err.message }));
};

exports.getPayroll = (req, res) => {
    Payroll.find({ employeeId: req.params.id })
        .then(payroll => res.json(payroll))
        .catch(err => res.status(404).json({ error: 'Payroll not found' }));
};
