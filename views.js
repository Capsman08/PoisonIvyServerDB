module.exports = function(app) {
	//Gets the html view to look at the data
	app.get('/itchy/poisonivy', (req, res, next) => {

		res.format({
			html: () => {
				res.render('index.ejs')
			}
		})
	});


	app.get('/itchy/poisonivymap', (req, res, next) => {

		console.log("html request")
		res.format({
			html: () => {
				res.render('reportMap.ejs');
			}
		})
	});


}

