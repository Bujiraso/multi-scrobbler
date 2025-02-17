export interface MalojaV2ScrobbleData {
    artists: string[]
    title: string
    album: string
    /**
     * Length of the track
     * */
    duration: number
    /**
     * unix timestamp (seconds) scrobble was made at
     * */
    time: number
}

export interface MalojaAlbumData {
    name?: string
    albumtitle?: string
    artists: string[]
}

export interface MalojaV3ScrobbleData {
    /**
     * unix timestamp (seconds) scrobble was made at
     * */
    time: number
    track: {
        artists: string[]
        title: string
        album?: MalojaAlbumData | null
        /**
         * length of the track
         * */
        length: number
    }
    /**
     * how long the track was listened to before it was scrobbled
     * */
    duration: number
}

export type MalojaScrobbleData = MalojaV2ScrobbleData | MalojaV3ScrobbleData;

export interface MalojaScrobbleRequestData {
    /** The auth key used to scrobble */
    key: string
    /** name of the track */
    title: string
    /** name of the album */
    album?: string
    /** unix timestamp of when the track was scrobbled*/
    time: number
    /** length of the track in seconds */
    length?: number
    /** number of seconds the track was listened to */
    duration?: number
}

export interface MalojaScrobbleV2RequestData extends MalojaScrobbleRequestData {
    /** comma-separated list of artists for this track */
    artist: string
}

export interface MalojaScrobbleV3RequestData extends MalojaScrobbleRequestData {
    /** a list of artists for this track */
    artists: string[]
    /** a list of artists for the album the track is on */
    albumartists: string[]
    /** skip server-side metadata parsing */
    nofix?: boolean
}

interface MalojaScrobbleWarning {
    type: string
    value: string[] | string
    desc: string
}

export interface MalojaResponseV3CommonData {
    status: 'failure' | 'error' | 'success' | 'ok'
    error?: {
        type: string
        value?: string | object
        desc: string
    }
}

export interface MalojaScrobbleV3ResponseData extends MalojaResponseV3CommonData {
    track?: {
        title: string
        artists: string[]
        album?: MalojaAlbumData | null
    }
    desc: string
    warnings?: MalojaScrobbleWarning[]
}
