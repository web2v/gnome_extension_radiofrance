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
    	this._stopStream();
  	}
  
  	let argv = ['vlc', '--control', 'dbus', '--no-xlib', '--intf', 	'dbus', url];
  	this._player = new Gio.Subprocess({ argv: argv, flags: Gio.SubprocessFlags.NONE });
  	this._player.init(null);
  	print("Lecture de la station:", url);
        }

    
    
    _stopStream() {
      if (this._player) {
   	this._player.send_signal(15); // SIGTERM
    	this._player.wait_check_async(null, (obj, res) => {
      try {
        obj.wait_check_finish(res);
      } catch (e) {
        logError(e, 'Erreur lors de l\'arrêt de VLC');
      }
      });
      this._player = null;
      print("Arrêt du flux");
      }
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
  _indicator = null; 
}
