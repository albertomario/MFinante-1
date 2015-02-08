var mfinanteRepository = require('./postform'),
    $ = require('cheerio');

module.exports = function(app) {
	app.get('/api/companyInfo', function(req, response) {
		var options = {
			host : 'www.mfinante.ro',
			port : 80,
			path : '/infocodfiscal.html',
			method : 'POST',
			encoding : 'utf8'
		};

		var code = '';
		if(req.query.cod == undefined){
			response.json({success: false, message :'invalid url parameters'})
		} else {

			if(req.query.cod.toLowerCase().indexOf('ro') == 0){
				code = req.query.cod.substring(2, req.query.cod.length);
			}
			else
			{
				code = req.query.cod;
			}
		}

		mfinanteRepository.postData({'cod' : code }, null, options, {}, function(err, res) {

			if(err){
				console.log(err);
				response.send('error');
			}

			var result = {
				taxCode : req.body.cod,
				name :'',
				county:'',
				address:'',
				phone:'',
				fax:'',
				zipCode:'',
				tradeRegisterCode:'',
				companyState:'',
				lastProccessDate:''
			};

			var main = null;
			if(res.body){

				$("#main TABLE TR TD", res.body).each(function(idx, obj){

					main = $(obj).text();
					if(main.indexOf('Denumire platitor')!= -1){
						result['name'] = $(obj).next().text().replace(/([\r\n\t])+/g, "").trim();
					}

					if(main.indexOf('Adresa:')!= -1){
						result['address'] = $(obj).next().text().replace(/([\r\n\t])+/g, "").trim();
					}

					if(main.indexOf('Judetul:') != -1){
						result['county'] = $(obj).next().text().replace(/([\r\n\t])+/g, "").trim();
					}

					if(main.indexOf('Numar de inmatriculare la Registrul') != -1){
						result['tradeRegisterCode'] = $(obj).next().text().replace(/([\r\n\t])+/g, "").trim();
					}

					if(main.indexOf('Codul postal:') != -1){
						result['zipCode'] = $(obj).next().text().replace(/([\r\n\t])+/g, "").trim();
					}

					if(main.indexOf('Telefon:') != -1){
						result['phone'] = $(obj).next().text().replace(/([\r\n\t])+/g, "").trim();
					}

					if(main.indexOf('Fax:') != -1){
						result['fax'] = $(obj).next().text().replace(/([\r\n\t])+/g, "").trim();
					}

					if(main.indexOf('Stare societate:') != -1){
						result['companyState'] = $(obj).next().text().replace(/([\r\n\t])+/g, "").trim();
					}
				});

				if(result.name.length != 0){
					response.json({success : true, companyInfo : result});
				}else {
					response.json({success : false, message : 'cant identify company'});
				}

			} else {
				response.json({success : false, message : 'Cant identify company with taxCode : ' + req.query.cod });
			}
		});
	});
};
