// also we dont need all of the subnodes in the .subnodes list for the json, we just need the uuids bc otherwise we will reference some nodes twice and that is annoying to have to deal with



////////////////////////
// SECTOR - VARIABLES //
////////////////////////

var d={"=":["equals","in 1","in 2"],"or":["or","in 1","in 2"],"and":["and","in 1","in 2"],"!":["not","bool"],"+":["add","in 1","in 2"],"-":["subtract","in 1","in 2"],"*":["mutiply","in 1","in 2"],"/":["divide","in 1","in 2"],"num":["0.0"],"str":["Hello world!"],"bln":["true"],"do":["do","in 1"],"put":["put","string"],"if":["if","test","test true","test false"],"getvar":["get","var"],"setvar":["set","var","val"],"changevar":["change","var","by"],"for":["for","var","start","end","step","do"],"^":["power","num","pwr"],"in":["input","prompt"],"join":["join","in 1","in 2"],"eval":["evaluate","js"],"chr":["getchar","index","string"],"uuid":["UUID"],"array":["array","item 1"],"index":["index","array","item"],"null":["null"],"undefined":["undefined"],"length":["length","array"],"run":["run","args","lambda"],"lambda":["lambda","do"]}

var nodelist=[]
var retval=0
var keyboard=[]

var lc=null

var variables={}
var buttonSignature=null;

////////////////////////
// SECTOR - FUNCTIONS //
////////////////////////

function getattrsoflistitems(list, attr, desired) {
  for (var obj of list) {
    var attrs = Object.entries(obj)
    for (var kv of attrs) {
      if (kv[0] == attr&&kv[1]==desired) {
        return obj;
      }
    }
  }
}

function nodestring(x1, y1, x2, y2, thickness) {
  noStroke();
  quad(x1-1, y1+thickness/2, x1-1, y1-thickness/2, x2+1, y2-thickness/2, x2+1, y2+thickness/2);
  stroke(0);
  line(x1, y1-thickness/2, x2, y2-thickness/2);
  line(x1, y1+thickness/2, x2, y2+thickness/2);
}

const delay = ms => new Promise(res => setTimeout(res, ms));

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function handleToolbarButton(sig) {
  setTimeout(function(){buttonSignature=sig},10);
}
function parentnodeindices(node) {
  for (var nn in nodelist) {
    for (var nn2 in nodelist[nn].subnodes) {
      if (nodelist[nn].subnodes[nn2]==node) return nn;
    }
  }
  return null;
}
function exportNodes() {
  var cNodes = JSONC.compress(JSON.parse(JSON.stringify(nodelist)));
  return JSON.stringify(cNodes);
}
function importNodes(str) {
  if (str==null||str=="") return;
  templist=JSONC.decompress(JSON.parse(str));
  uuids={}
  for (var n of templist) {
    Object.setPrototypeOf(n,Nodebox.prototype)
    uuids[n.nodeID]=n;
  }
  console.log(uuids);
  nodelist=[];
  for (var key in uuids) {
    nodelist.push(uuids[key]);
  }
  for (var n of nodelist) {
    n.updateSubnodes();
    n.active=false;
  }
  cleanNodelist();
  console.log(nodelist)
}
function alertimport() {
  importNodes(prompt("Import:"))
}
function alertexport() {
  const el = document.createElement('textarea');
  el.setAttribute('height', '0.01px')
  el.value = exportNodes();
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert("Copied to clipboard!");
}

document.addEventListener("keydown", function(e) {
  if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
    e.preventDefault();
    // Process the event here (such as click on submit button)
    history.pushState();
  }
}, false);
function safeDeleteAll() {
  let confirm=(Math.floor(Math.random()*90000)+10000)
  let x=prompt("Type "+confirm+" to comfirm delete all")
  if (x==confirm) {
    for (var n of nodelist) {
      n.delete();
    }
    nodelist=[];
    alert("All blocks deleted");
  } else {
    alert("Delete cancelled")
  }
}

function makeNode() {
      let x=prompt("Make:")
    while (d[x]===undefined) if (x!==null) {x=prompt("Make:")} else return
    if (x==="for") {
      new Nodebox("for",[new Nodebox("str",[],d.str,"var 1"),new Nodebox("num",[],d.num,0),new Nodebox("num",[],d.num,5),new Nodebox("num",[],d.num,1),new Nodebox("do",[],d.do)],d["for"])
    }
    else if (x.search("var")!==-1) {
      new Nodebox(x,[new Nodebox("str",[],d.str,"var 1")],d[x])
    }
    else {new Nodebox(x,[],d[x])}
}

function cleanNodelist() {
  let update={};
  for (var n of nodelist) {
    update[n.nodeID]=n;
  }
  nodelist=[]
  for (var n in update) {
    nodelist.push(update[n])
  }
}

////////////////////
// SECTOR - p5.js //
////////////////////

function preload() {
  gameFont="Courier New"
}

function setup() {
  createCanvas(window.innerWidth,window.innerHeight)
  strokeCap(ROUND);
  strokeJoin(ROUND);
  n3=new Nodebox("str",[],d.str)
  n3.x=205
  n3.y=5
  n2=new Nodebox("put",[n3],d.put)
  n2.x=105
  n2.y=5
  n1=new Nodebox("do",[n2],d.do)
  n1.names.push("in 2")
  n1.x=5
  n1.y=5
}

function draw() {
  background(220);
  for (var nn2 in nodelist) {
    nodelist[nn2].nodestrings()
  }
  for (var nn in nodelist) {
    nodelist[nn].shape() 
  }
  if (lc!==null && nodeno!==null) {
    stroke(170)
    line(nodelist[nodeno].x+nodelist[nodeno].xs,nodelist[nodeno].y+45+nodelist[nodeno].subnodes.length*30,lc[0],lc[1])
    stroke(0,0,0,0)
  }
}


/////////////////////
// SECTOR - EVENTS //
/////////////////////

var nodeno=null
window.onclick=async function(event){
  for (var i in nodelist) {
    if (nodelist[i].bounds(mouseX,mouseY)) { //if clicked
      if (keyboard[16]) { //bondblock
        if (nodeno===null) {
          if (nodelist[i].names.length-1>nodelist[i].subnodes.length) nodeno=i
        } else {
          if (nodelist[nodeno]!==nodelist[i]) {
            nodelist[nodeno].subnodes.push(nodelist[i])
            if (nodelist[nodeno].type=="do") {
              nodelist[nodeno].names.push("in "+nodelist[nodeno].names.length)
            }
            if (nodelist[nodeno].type=="array") {
              nodelist[nodeno].names.push("item "+(nodelist[nodeno].names.length))
            }
            nodeno=null
          }
        }
      } else { //setvalue
        if (!isclickdrag) {
          switch (buttonSignature) {
            case "delete":
              nodelist[i].delete();
              break;
            case "reset":
                    nodelist[i].subnodes=[]
        if (nodelist[i].type==="do") nodelist[i].names=["do","in 1"]
                if (nodelist[i].type==="array") nodelist[i].names=["array","item 1"]
        break
            case null:
              let res=nodelist[i].menu();
              nodelist[i].update(res);
              if (res!==undefined&&nodelist[i].type!="str"&&nodelist[i].type!="num"&&nodelist[i].type!="bln") {
                  alert(await nodelist[i].result())
                }
                else {
                  await nodelist[i].result()
                };
          }
        }
      }
      keyboard[83]=false
      
    }
  }
  buttonSignature=null;
}
var isclickdrag=false;
var subjectno = null;
window.onmousedown=function(event) {
    isclickdrag=false;
  if ((!keyboard[83])&&(!keyboard[71])&&(!keyboard[82])&&(!keyboard[16])&&(!keyboard[68])) {
    for (var nn in nodelist) {
      if (nodelist[nn].bounds(mouseX,mouseY)) {
        subjectno=nn;
        break;
      }
      
    }
  }
  
}
window.onmousemove=function(event) {
    isclickdrag=true;
  if (subjectno!==null) {
    nodelist[subjectno].x=event.x-nodelist[subjectno].xs/2
    nodelist[subjectno].y=event.y-nodelist[subjectno].ys/2
  }
  if (nodeno!==null) {
    lc=[event.x,event.y]
  }
  else {lc=null}
}
window.onmouseup=function(){subjectno=null}

function keyDown(event) {
  keyboard[event.keyCode] = true;
  if (event.keyCode==77) {
    makeNode();
  }
}

function keyUp(event) {
  keyboard[event.keyCode] = false;
  if (event.keyCode==16) {
    nodeno=null
  }
}
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
document.addEventListener('contextmenu', function(e) {
  for (var nn in nodelist) {
    if (nodelist[nn].bounds(mouseX,mouseY)) {
          nodelist[nn].delete();
            e.preventDefault();
          }
      }
    
  }, false);