/**
*  Data lib file - Functions to perform CRUD on files stored in .data
*  i.e read files, write files, list files, update files, delete files
**/

const fs = require('fs');
const path = require('path');
const { createBrotliCompress } = require('zlib');
const helpers = require('./helpers');

const lib = {};

// set base path for .data directory
lib.baseDir = path.join(__dirname, '/../.data');

/*=============================
    Create file
=============================*/

lib.create = (dir, filename, data, callback) => {
    const filepath = `${lib.baseDir}/${dir}/${filename}.json`;

    // open file for writing, if err file already exists
    fs.open(filepath, 'wx', (err, fileDescriptor) => {

        // no error, proceed, else return
        if (!err && fileDescriptor) {
            fs.writeFile(fileDescriptor, JSON.stringify(data), err => {

                // if no error, close file and return false
                if (!err) {
                    fs.close(fileDescriptor, err => {
                        if (!err) callback(false);
                        else callback('error closing write file');
                    })
                }
                else callback('error writing to file')
            })
        }
        else callback('could not create new file, it may already exist');
    });
};

/*=============================
   Read file
=============================*/

lib.read = (dir, filename, callback) => {
    const filepath = `${lib.baseDir}/${dir}/${filename}.json`;
    // open file, return content as object, if err file does not exist
    fs.readFile(filepath, 'utf-8', (err, data) => {
        if (!err && data) callback(false, helpers.parseJsonToObject(data));
        else callback(err, data);
    })
};

/*=============================
    Update file
=============================*/

lib.update = (dir, filename, data, callback) => {
    const filepath = `${lib.baseDir}/${dir}/${filename}.json`;

    fs.open(filepath, 'r+', (err, fileDescriptor) => {
        // if file exists
        if (!err && fileDescriptor) {

            // zero truncate gile and overwrite
            fs.ftruncate(fileDescriptor, 0, err => {
                if  (!err) {
                    fs.writeFile(fileDescriptor, JSON.stringify(data), err => {
                        if (!err) fs.close(fileDescriptor, err => {
                            // false indicates no errors
                            if  (!err) callback(false);
                            else callback('error closing file');
                        })
                        else callback('error writing / updating file')
                    });
                }
                else callback('error truncating file')
            });
        }
        else callback('could not open file, it may not exist');
    });
};

/*=============================
    Delete file
=============================*/

lib.delete = (dir, filename, callback) => {
    const filepath = `${lib.baseDir}/${dir}/${filename}.json`;

    fs.unlink(filepath, err => {
        if (!err) callback(false)
        else callback(500, 'Error deleting file');
    });
};

/*=============================
    List files
=============================*/

lib.list = (dir, callback) => {
    const dirpath = `${lib.baseDir}/${dir}/`;

    fs.readdir(dirpath, (err, data) => {
        if (!err && data && data.length > 0) {
            const fileNames = data.map(fileName => fileName.replace('.json', ''));
            callback(false, fileNames);
        }
        else callback(err, data);
    });
};


// exports
module.exports = lib;