
/**
 *  main():  Main code.
 */
exports.sizeof = function (obj){
  var count = 0;
  for(var i in obj)
      if(obj.hasOwnProperty(i))
          count++;

  return count;
};