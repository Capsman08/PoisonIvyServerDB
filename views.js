module.exports = function(app) {
	//Gets the html view to look at the data
	app.get('/itchy/poisonivy', (req, res, next) => {

		res.format({
			html: () => {
				res.render('index.ejs')
			}
		})
	});

}