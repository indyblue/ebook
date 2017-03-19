// requires
	var fs = require('fs');
	var path = require('path');
	var exec = require('child_process').exec;
	var textile = require('textile.das');

var t = new textile();

/*
var test = 'p[la]{display:inline-block;}(((<(a s#df). This *is* a _test_, %(r)wonder% if it will work.';
test = "Lear chef-d'-\oeuvre, Messieurs, c'est de s'\'etre fait nier par ce si\`ecle.";
console.log(test);
console.log(t.toHtml(test));
return;
// */

var fpath = __dirname;
if(process.argv.length>2) 
	fpath = process.argv[2];

var filter = /^\d.*\.(txt|vi)$/i;
if(process.argv.length>3) {
	var ext = process.argv[3];
	if(/^\.[a-z0-9]$/i.test(ext))
		filter = new RegExp('^.*\\'+ext+'$','i');
	else if(/^\/[^\/]*\/[^\/]*$/.test(ext)) {
		sp = ext.split('/');
		filter = new RegExp(sp[1], sp[2]);
	}
}

var pStat = fs.statSync(fpath);
var files = [];
if(pStat.isFile()) {
	var pp = path.parse(fpath);
	files.push(pp.base);
	fpath = pp.dir;
}
else if(pStat.isDirectory()) 
	files = fs.readdirSync(fpath);

//console.log(fpath);
if(filter instanceof RegExp) {
	//console.log(filter);
	files = files.filter(x=> filter.test(x));
}

//console.log(files);

var htm = '';
for(var i=0;i<files.length;i++){
	var ipath = path.join(fpath, files[i]);
	var txt = fs.readFileSync(ipath, 'utf8');
	var txtHtm = t.toHtml(txt);
	htm += txtHtm;
	//console.log(ipath, txt.length, htm.length);
	txtHtm.replace(/<[^>]*>/g,'').replace(/['"]/g, function(q,i,str){
		console.log(ipath, txt.length, htm.length);
		console.log('***** quote error - ' + str.substr(i-50,100));
	});
}
var $doc = t.doc();
var $txt = $doc.find('#htmlout');
$txt.html(htm);
var $fn = $doc.find('#fnout');
t.fnMove($txt, $fn);
t.tocBuild('h2','h3');


var fnCamel = (str) => str.replace(/([^a-z0-9]*)([a-z0-9]+)([^a-z0-9]*)/gi, function(m,nw1, w, nw2){
		return w[0].toUpperCase() + w.substr(1).toLowerCase();
	});

var title1 = $doc.find('.title1').text();
var title2 = $doc.find('.title2').text();
var author = $doc.find('.author').text();
var fname = fnCamel(title1) + '_' + fnCamel(author);
console.log(title1, title2, author);
console.log(fname);

var outdir = __dirname; //path.dirname(fpath);
var outfile = path.join(outdir, fname);

fs.writeFileSync(outfile+'.html', $doc.html());

var cmd = 'ebook-convert "'+outfile+'.html" "'+outfile+'.{ext}"'
	+' --title "'+title1+'" '
	+' --comments "'+title2+'" '
	+' --authors "'+author+'" '
	+" --chapter \"//*[name()='h1' or name()='h2']\" "
	+" --page-breaks-before \"//*[name()='h1' or name()='h2' or name()='h3']\" "
	+" --level1-toc \"//*[name()='h2']\" "
	+" --level2-toc \"//*[name()='h3']\" "
	+" --max-toc-links 500 --duplicate-links-in-toc  --toc-threshold 500";

var type = ['epub', 'mobi'];
for(var i=0;i<type.length;i++){
	var cmde = cmd.replace(/{ext}/g,type[i]);
	console.log(cmde);
	exec(cmde, function(error, stdout, stderr) {
	  console.log('stdout', stdout);
	  console.log('error', error);
	  console.log('stderr', stderr);
	});
}

