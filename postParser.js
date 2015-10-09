function postParse(c){
  var mt;
  //get the yaml matters
  var patt = /---([\s\S]*?)---(\r\n|\n)([\s\S]*)/;
  var res = c.match(patt);
  mt = {};
  mt['meta'] = YAML.parse(res[1]);
  mt['content'] = res[3];
  return mt;
}
