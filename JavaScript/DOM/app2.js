//classList property
let img=document.querySelector('img');
console.log(img.classList);

let heading=document.querySelector('h1');
console.log(heading.classList);
heading.classList.add('green');
heading.classList.add('underline');
heading.setAttribute('class','red');    //removes all class names, sets to red

heading.classList.remove('red');
heading.classList.add('green');
console.log(heading.classList.contains('red'));
console.log(heading.classList.contains('green'));

heading.classList.toggle('green');          //removes class green
console.log(heading.classList.contains('green'));

heading.classList.toggle('underline');         //adds class underline
console.log(heading.classList.contains('underline'));

heading.classList.toggle('green');          //adds class green
console.log(heading.classList.contains('green'));

console.log(heading.classList);


let box=document.querySelector('.box');
console.log(box.classList);
box.classList.add('yellowBg');
console.log(box.classList);


let h4=document.querySelector('h4');
console.dir(h4.parentElement);
console.dir(h4.children);

console.dir(box.parentElement);
console.dir(box.children);

let ul=document.querySelector('ul');
console.dir(ul.parentElement);
console.dir(ul.children);
console.dir(ul.previousElementSibling);
console.dir(ul.nextElementSibling);