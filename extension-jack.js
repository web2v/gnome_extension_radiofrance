//cette version focnitonne avec le lecteur vlc par dbus, ce qui n est pas conseille par l equipe gnome.
//néanmoins, avec jackd dbus ça bloc , hors j utilise jackd. ainsi clicquer sur arreter tuera toutes les instances VLC en cours de route..; 
//dc si vous avez une playlist ouverte dans vlc et que vous cliquer sur arrter dasn l extension , adios la playlist.. 
//cest un default mais l extension fonctionne parfaitemetn tandis qua avec dbus sur jackd ... ça bloque.. ! 
//renomer ce fichier extension.js et placez le dans le dossier de l extension.  radiofrance@votre_nom_d_user
const {Gio, GLib, GObject, St, Clutter} = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;

const RadioFranceStation = class RadioFranceStation {
  constructor(name, url) {
    this.name = name;
    this.url = url;
  }
};

const stations = [
  new RadioFranceStation("France Inter", "http://direct.franceinter.fr/live/franceinter-midfi.mp3"),
  new RadioFranceStation("France Culture", "http://direct.franceculture.fr/live/franceculture-midfi.mp3"),
  new RadioFranceStation("France Info", "http://direct.franceinfo.fr/live/franceinfo-midfi.mp3"),
  new RadioFranceStation("FIP Jazz", "http://direct.fipradio.fr/live/fip-webradio1.mp3"),
  // Ajoutez d'autres stations ici en suivant le modèle ci-dessus
];


const RadioFranceIndicator = GObject.registerClass(
  class RadioFranceIndicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, 'Radio France');

      let icon = new St.Icon({
        icon_name: 'radio-symbolic',
        style_class: 'system-status-icon',
      });
      this.add_child(icon);

      stations.forEach((station) => {
        let item = new PopupMenu.PopupMenuItem(station.name);
        item.connect('activate', () => {
          this._stopStream();
          this._playStream(station.url);
        });

        this.menu.addMenuItem(item);
      });

      let stopMenuItem = new PopupMenu.PopupMenuItem('Arrêter');
      stopMenuItem.connect('activate', this._stopStream.bind(this));
      this.menu.addMenuItem(stopMenuItem);
    }
    _playStream(url) {
      if (this._player) {
        Util.spawn(['qdbus', 'org.mpris.MediaPlayer2.vlc', '/org/mpris/MediaPlayer2', 'org.mpris.MediaPlayer2.Player.Stop']);
        GLib.spawn_command_line_async("pkill -f --signal TERM 'vlc --control dbus'");
        this._player = null;
      }
      
      this._player = Util.spawn(['vlc', '--control', 'dbus', '--no-xlib', '--intf', 'dbus', url]);

      print("Lecture de la station:", url);
    }
    
    
    
    // stop stream
    _stopStream() {
      Util.spawn(['killall', 'vlc']);
      this._player = null;
      print("Arrêt du flux");
  }
    
  }
);

let _indicator;

function init() {
}

function enable() {
  _indicator = new RadioFranceIndicator();
  Main.panel.addToStatusArea('radio-france', _indicator);
}

function disable() {
  _indicator.destroy();
}
