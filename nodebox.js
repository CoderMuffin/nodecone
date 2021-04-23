function getnodecolor(type) {
    switch (type) {
      case "bln":
      case "and":
      case "or":
      case "!":
        fill(100,255,100);
        break
      case "join":
      case "str":
      case "getchar":
        fill(255,100,150);
        break
      case "num":
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
      case "^":
        fill(100,140,255);
        break;
      case "do":
        fill(255,255,0);
        break;
      case "put":
      case "in":
      case "if":
        fill(255,150,0);
        break;
      case "array":
      case "index":
      case "length":
        fill(150,255,255);
        break;
      default:
        fill(190,160,220);
    }
}

class Nodebox {
  constructor(type, sbnds, names, val, dummy) {
    nodelist.push(this)
    this.dummy=dummy;
    this.nodeID=uuidv4();
    this.x=Math.random()*(window.innerWidth-100);
    this.y=Math.random()*window.innerHeight;
    this.type=type;
    this.names=[...names];
    this.subnodes=sbnds;
    this.active = false;
    this.value=val!==undefined?val:(type=="bln"?true:(type=="num"?0.0:(type=="str"?"Hello world!":(type=="array"?[]:null))));
    if (this.type=="bln" || this.type=="num" || this.type=="str") this.names[0]=this.value.toString()
  }
  async result() {
    this.active=true;
    if (this.type=="if") {
      if (this.subnodes[0].result()) {
        return await this.subnodes[1].result()
      } else {
        return await this.subnodes[2].result()
      }
    }
    
    if (this.type=="lambda") {
      let sbn=this.subnodes[1]
      return function(args){sbn.result()}
    }
    if (this.type=="for") {

      for (var j = await this.subnodes[1].result(); j < await this.subnodes[2].result(); j+=await this.subnodes[3].result()) {
        variables[await this.subnodes[0].result()]=j
        await this.subnodes[4].result()
      }
      return variables[await this.subnodes[0].result()]
    }
    await delay(50);
    let noderes=[];
    for(var nn of this.subnodes) {
      noderes.push(await nn.result());
    }
    await delay(50);
    this.active=false;
    if (this.type=="str"||this.type=="bln"||this.type=="num") {
      return this.value;
    }
    if (this.type=="array") {
      return noderes
    }
    if (this.type=="=") {
      return noderes[0]===noderes[1]
    }
    if (this.type=="and") {
      return noderes[0] && noderes[1]
    }
    if (this.type=="or") {
      return noderes[0] || noderes[1]
    }
    if (this.type=="!") {
      return !noderes[0]
    }
    if (this.type=="+") {
      return noderes[0] + noderes[1]
    }
    if (this.type=="-") {
      return noderes[0] - noderes[1]
    }
    if (this.type=="*") {
      return noderes[0] * noderes[1]
    }
    if (this.type=="/") {
      return noderes[0] / noderes[1]
    }
    if (this.type=="^") {
      return noderes[0] ^ noderes[1]
    }
    if (this.type=="setvar") {
      variables[noderes[0]]=noderes[1]
    }
    if (this.type=="getvar") {
      return variables[noderes[0]]
    }
    if (this.type=="changevar") {
      variables[noderes[0]]+=noderes[1]
    }
    if (this.type=="put") {
      alert(noderes[0])
    }
    if (this.type=="in") {
      return window.prompt(noderes[0])
    }
    if (this.type=="join") {
      return noderes[0].toString()+noderes[1];
    }
    if (this.type=="eval") {
      return eval(noderes[0]);
    }
    if(this.type=="getchar"){
      return noderes[1].charAt(noderes[0]);
    }
    if (this.type=="uuid") {
      return uuidv4();
    }
    if (this.type=="null") {
      return null;
    }
    if (this.type=="undefined") {
      return undefined;
    }
    if (this.type=="index") {
      return noderes[0][noderes[1]-1]
    }
    if (this.type=="run") {
      return noderes[1](noderes[0])
    }
    if (this.type=="length") {
      return noderes[0].length;
    }
  }
  shape() {
    let s = this.names.join("\n\n");
    let long = [...this.names].sort(function (a, b) { return b.length - a.length; })[0].length;      
    let xs=(long*7.2)+20;
    let ys=this.names.length*30;

    getnodecolor(this.type);
    strokeWeight(1);
    noStroke();
    rect(this.x, this.y, xs, ys, 0, 10, 10, 0);
    stroke(0);
    getnodecolor(this.type);
    rect(this.x, this.y, xs+3, ys+3, 0, 10, 10, 0);
    //ellipse(this.x, this.y, 5)
    //ellipse(this.x+this.xs, this.y+this.ys, 5)
    if (this.active) {
      noFill();
      stroke(255, 255, 0)
      strokeWeight(2);
      rect(this.x-2, this.y-2, xs+4, ys+4, 0, 10, 10, 0);
      strokeWeight(1);
    }
    fill(50);
    stroke(0,0,0,0)
    textFont(gameFont)
    text(s, this.x+10, this.y+10, xs, ys);
    this.xs=xs
    this.ys=ys
  }
  bounds(x,y) {
    let x1=this.x
    let y1=this.y
    let x2=this.x+this.xs
    let y2=this.y+this.ys
    return (x1<x&&x<x2&&y1<y&&y<y2)
  }
  menu() {
    retval=0
    switch (this.type){
      case "bln":
        return(!this.value)
      case "num":
        let p=Number(prompt("Enter a value"))
        while (isNaN(p)) p=Number(prompt("Enter a value"))
        return (p)
      case "str":
        return(prompt("Enter a value"))
      default:
        retval=1
        return;
    }
  }
  update(val) {
    if (retval===1) return (false)
    this.value=val===null?this.names[0]:val
    this.names[0]=this.value.toString()
    return false
  }
  nodestrings() {
    stroke(50)
    for (var i in this.subnodes) {
      let n=this.subnodes[i]
      let y=this.y+45+(i*30)
      fill(255);
      if (this.active) {
        fill(255, 255, 100);
        nodestring(this.x+this.xs,y,n.x,n.y+15,12)
      } else {
        nodestring(this.x+this.xs,y,n.x,n.y+15,12)
      }
    }
  }
  delete() {
    let pi = parentnodeindices(this);
    if (pi!==null) {
      for (var n in nodelist[pi].subnodes) { //remove from parent
        if (nodelist[pi].subnodes[n]==this) {
          nodelist[pi].subnodes.splice(n,1);
        }
      }
      if (nodelist[pi].type=="do") {
        nodelist[pi].names.pop();
      }
    }
    const index = nodelist.indexOf(this);
    if (index > -1) {
      nodelist.splice(index, 1);
    }
  }
  updateSubnodes() {
    let outputsubnodes=[]
    for (var n of this.subnodes) {
      outputsubnodes.push(Object.assign(new Nodebox(null,[],[],null,true),getattrsoflistitems(this.subnodes,"nodeID",n.nodeID)))
      
    }
    this.subnodes=outputsubnodes;
    for (var n of this.subnodes) {
      console.log(n);
      n.updateSubnodes();
      // oo recursion
    }
  }
}