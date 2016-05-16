
var winston = require('winston');
var date = new Date();

function formatDateYYYYMMDD(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

date = formatDateYYYYMMDD(date);

var logger;
var self = module.exports = {

		logger : new (winston.Logger)({
			  transports: [
			    new (winston.transports.File)({
			      name: 'info-file',
			      filename: 'logs/Server-'+date+'.log'
			    }),
			   
			    new (winston.transports.File)({
			      name: 'error-file',
			      filename: 'logs/Server-error-'+date+'.log',
			      level: 'error'
			    })
			  ]
			})
		  
};