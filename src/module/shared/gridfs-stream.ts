import * as GridFsStream from 'gridfs-stream';

export function CreateGridFsStream(db: any, mongo: any) {
    return GridFsStream(db, mongo);
};

export { GridFsStream };

