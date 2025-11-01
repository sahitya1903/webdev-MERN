let nums=[2,4,6,8];
console.log(nums);
console.log(nums[2]);
console.log(typeof nums);

let mix=[1,"Sahitya",9.26];
console.log(mix);
console.log(mix.length);
console.log(mix[1]);
console.log(mix[1][3]);

mix[2]=8.57;
console.log(mix); //arrays are mutable

mix[5]=0;
console.log(mix);
console.log(mix.length);


mix.pop();
console.log(mix);

mix.push("A");
console.log(mix);

mix.shift();
console.log(mix); 

mix.unshift(0);
console.log(mix);


