// requires
	var fs = require('fs');
	var path = require('path');
	var $ = require('cheerio');
	const translate = require('google-translate-api');

var fname = process.argv[2];
var fpath = path.join(__dirname, fname);
var frlang = process.argv[3];

var htm = fs.readFileSync(fpath, 'utf8');
var $doc = $.load(htm)('html');
var $body = $doc.find('#htmlout');

var $secs = $body.children();
$secs.remove();

var $table = $('<table/>').appendTo($body);

var tEnglish = [];
try{
	var eng = fs.readFileSync(fpath + '.json', 'utf8');
	tEnglish = JSON.parse(eng);
} catch(e) { }

var tPromises = [];
$secs.each((i,e)=> {
	var itxt = $(e).text();
	if(itxt!='') {
		var $tr = $('<tr/>').appendTo($table);
		$('<td/>').append(e).appendTo($tr);
		if(i>=tEnglish.length || typeof tEnglish[i]!=='string' || tEnglish[i]==='') {
			console.log('fetching translation: ', i);
			var tp = translate(itxt, {from: frlang, to: 'en'}).then(res => {
				$('<td/>').prepend(res.text).appendTo($tr);
				tEnglish[i] = res.text;
			}).catch(e=> {
				console.log(e);
			});
			tPromises.push(tp);
		} else {
			console.log('cached translation: ', i);
			$('<td/>').prepend(tEnglish[i]).appendTo($tr);
		}
	}
});

Promise.all(tPromises).then(x=> {
	fs.writeFileSync(fpath+'_trans.html', $doc.html());
	fs.writeFileSync(fpath+'.json', JSON.stringify(tEnglish,null,2));
});


