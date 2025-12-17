let div=document.querySelector('div');
let ul=document.querySelector('ul');
let li=document.querySelectorAll('li');

div.addEventListener('click',()=>console.log("div clicked"));
ul.addEventListener('click',function(event){
    console.log("ul clicked");
});
for (i of li) {
    i.addEventListener('click',function(event){
        event.stopPropagation();    //only li click showing
        console.log("li clicked");
    });
}
