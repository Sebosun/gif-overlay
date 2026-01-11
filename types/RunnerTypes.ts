export interface FetchResult {
  total: string;
  stamps: Stamps[];
}

export interface Stamps {
  id: string;
  name: string;
  srcThumb: string;
  srcNormal: string;
  isAnimated: boolean;
  isGif: boolean;
  isSprite: boolean;
  frameTimes: string[];
  width: string;
  height: string;
}

export interface DownloadImage {
  name: string;
  isGif: boolean;
  imageUrl: string;
  width: number;
  height: number;
}

export interface RunnerOpts {
  saveDir: string;
  start: number;
  end: number;
  tag: string;
}
