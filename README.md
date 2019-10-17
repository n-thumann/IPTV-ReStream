# IPTV-ReStream #
This app allows remotely viewing source-specific multicast RTP streams (e.g. Deutsche Telekom MagentaTV), by forwarding it using HTTP.

![Status Page](https://user-images.githubusercontent.com/46975855/67150900-fa160a80-f2bd-11e9-91e3-944d8f5272c3.png)
![Stations Page](https://user-images.githubusercontent.com/46975855/67150901-faaea100-f2bd-11e9-8776-e07fafba408a.png)

## Features
* lightweight: there is no de- or encoding happening, the stream is simply forwarded
* simple Dashboard with Statistics
* Station List with Images
* VLC-ready playlist included
* automatic running program detection (from MPEG-TS stream)

## Installation
1. Install [Node.js](https://nodejs.org/en/) (v13.1 or higher)
2. Clone this Repo: `git clone https://github.com/n-thumann/IPTV-ReStream` or click 'Download'
3. Install dependencies `npm install` and transpile `tsc`
4. Download [this list](https://db.iptv.blog/multicastadressliste.json) of stations (by [iptv.blog](https://db.iptv.blog/multicastadressliste)) and place it in the `data` directory
5. Export environment variables (see below), if necessary
6. Run `npm start`

Or with Docker:
1. [Install](https://docs.docker.com/v17.12/install/) Docker
2. run `docker run -d --network host --restart always --name IPTV-ReStream [-e HOST="127.0.0.1" -e PORT=1337 -e XSPF_PROTOCOL="https" | -e XSPF_HOST="my.server.com:8080" | -e XSPF_PATH_PREFIX="/iptv" | -e ALLOW_UNKNOWN="false" | -e DEBUG="iptv-restream:*"] nthumann/iptv-restream:latest` (parameters in brackets are optional)

### Configuration ###
It´s highly recommended to run this application behind a Reverse Proxy ([nginx](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) or [Apache httpd](https://httpd.apache.org/docs/2.4/howto/reverse_proxy.html)) that enforces authentication (and encryption). When using a reverse proxy it´s probably mandatory to adjust enviroment variables `XSPF_PROTOCOL`, `XSPF_HOST` and `XSPF_PATH_PREFIX`, otherwise the application may generate an invalid VLC XSPF-Playlist. For example, if the application is reachable over a Reverse Proxy via https://my.server.com:8080/iptv, then run `export XSPF_PROTOCOL=https XSPF_HOST=my.server.com:8080 XSPF_PATH_PREFIX=/iptv`. Also, if the clients real IP and Port should be visible on the Dashboard, make sure to pass HTTP Headers `X-Real-IP` and `X-Real-Port` from the Reverse Proxy to the Application.

### Environment Variables
| Variable | Description |
| -------- | ----------- |
| HOST | Webinterface Listen Host (default `127.0.0.1`) |
| PORT | Webinterface Listen Port (default `3000`) |
| XSPF_PROTOCOL | Protocol (`http`/`https`) for generating XSPF |
| XSPF_HOST | Host and Port for generating XSPF |
| XSPF_PATH_PREFIX | Path Prefix for generating XSPF |
| ALLOW_UNKNOWN | Allow forwarding streams that are not in the station list (default `0`/`false`) |
| DEBUG | Enable Debug Logging (`iptv-restream:*`) |

### Usage
Open the webinterface and navigate to `Stations`, then download the XSPF Playlist for VLC and open it. Done!

It is also possible to access the source-specific multicast streams directly by opening `/live/mcast_source@mcast_group:mcast_port` (e.g. `/live/87.141.215.251@232.0.20.35:10000` for Das Erste HD) or by using the shortcut at `/live/station/station_title` (e.g. `/live/station/ZDFSD` for ZDF SD).

## Under the hood ##
For example MagentaTV delivers the H.264 video stream via MPEG-TS, wrapped into RTP packets over source specific multicast. Therefore it is not possible to access this stream when connected to a non-MagentaTV line. This app is proxying the video stream: It receives it, just as usual, at your Telekom line at home and re-streams it over HTTP to your other devices. This concept is inspired by [udpxy](https://github.com/OmegaVVeapon/udpxy).