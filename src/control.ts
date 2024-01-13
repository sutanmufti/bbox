import mapboxgl from "mapbox-gl";

// Control implemented as ES5 prototypical class
export default function clearControl(this: any, callback: ()=>void) {
    this.callback = callback;

 }

clearControl.prototype.onAdd = function(map: mapboxgl.Map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl bg-white/90 p-2 rounded';
    this._container.appendChild(generateButton(this.callback));
    return this._container;
};

clearControl.prototype.onRemove = function () {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
};



function generateButton(cb: ()=>void){
    const button = document.createElement('button');
        button.textContent = 'Remove';
        button.style.cursor = 'pointer';
        button.onclick = cb

    return button
}