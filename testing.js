// a file just to test javascript bullshit, feel free to use
/*
var dict = {'boop':3};

dict['key'] = "testing";
dict['key2'] = "testing2";
delete dict['key'];

console.log(dict);
console.log('boop' in dict)

// using Set.prototype.add(value) 
// creating an empty set 
var set1 = new Set([1,2]); 
  
// set contains 10, 20 
set1.add(10); 
set1.add(20); 
  
// As this method returns 
// the set object hence chanining  
// of add method can be done. 
set1.add(30).add(40).add(50); 
  
// prints 10, 20, 30, 40, 50 
console.log(set1); 

console.log('eh?',set1.delete(50)); 
console.log('here',set1.has(50)); 
console.log(set1); 
*/

        
    function convertSecString(getString, num){
      if getString==True {
      var secs = (num) % 1;
      secs = secs * 60;
      var mins = Math.floor(num);
        return mins.toString() + "min " + secs.toString + "s";
      }
      else
        {
          
        }
    }


    console.log(convertSecString(true, 2.5))