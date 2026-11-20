import ac from "../../assets/images/ac.webp";
import carpenter from "../../assets/images/carpenter.webp";
import electrician from "../../assets/images/electrician.webp";
import cleaning from "../../assets/images/cleaning.webp";
import painter from "../../assets/images/painter.webp";
import plumber from "../../assets/images/plumber.webp";
import { Wrench, Hammer, Zap, Wind, Sparkles, Paintbrush, Briefcase } from "lucide-react";
export function categoryIcon(name) {
 const n=String(name||"").toLowerCase();
 return n.includes("plumb")?Wrench:n.includes("carpent")?Hammer:n.includes("electric")?Zap:n.includes("clean")?Sparkles:n.includes("paint")?Paintbrush:n.includes("ac repair")?Wind:Briefcase;
}
export default function CategoryArt({name,className="h-36"}) {
 const n=String(name||"").toLowerCase();
 const photo=n.includes("plumb")?plumber:n.includes("carpent")?carpenter:n.includes("electric")?electrician:n.includes("clean")?cleaning:n.includes("paint")?painter:n.includes("ac repair")?ac:null;

 return <div className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-white text-blue-700 ${className}`} aria-hidden="true">{photo?<img src={photo} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"center",display:"block"}} className="h-full w-full object-contain object-center"/>:<Briefcase size={48}/>}</div>;
}
