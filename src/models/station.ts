export class Station {
    readonly title: string;
    readonly mcast_source: string;
    readonly mcast_group: string;
    readonly mcast_port: string;
    readonly image: string;

    constructor(title: string, mcast_source: string, mcast_group: string, mcast_port: string, image: string) {
        this.title = title;
        this.mcast_source = mcast_source;
        this.mcast_group = mcast_group;
        this.mcast_port = mcast_port;
        this.image = image;
    }
}