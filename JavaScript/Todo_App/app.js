let input=document.querySelector('input');
let button=document.querySelector('button');
let ul=document.querySelector('ul');

button.addEventListener('click',()=>{
    console.log('clicked');
    let li=document.createElement('li');
    li.innerText=input.value+" ";
    ul.appendChild(li);

    let delBtn=document.createElement('button');
    delBtn.innerText='Delete';
    delBtn.classList.add('del');
    li.appendChild(delBtn);
    input.value='';
});

ul.addEventListener('click',function(event){
    console.dir(event.target.nodeName);         //tells event source
    if (event.target.nodeName=="BUTTON") {
        let item=event.target.parentElement;
        console.log(item);
        item.remove();
        console.log('Task deleted');
    }
})


// let delBtns=document.querySelectorAll('.del');
// for(delBtn of delBtns){
//     delBtn.addEventListener('click',function(){
//         let par=this.parentElement;
//         par.remove();
//     });
// }

