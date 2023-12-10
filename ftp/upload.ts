import * as ftp from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config();

console.log(process.env.ftphost);

const remoteRootFolder = '/pdfviewer.net';

synchronizeDistFolderWithFtpFolder();

function collectFiles(dir: string, allFiles: Array<string> = [], allFolders: Array<string> = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      allFolders.push(filePath);
      collectFiles(filePath, allFiles, allFolders);
    } else {
      allFiles.push(filePath);
    }
  });

  return allFiles;
}

async function collectRemoteFiles(client: ftp.Client, dir: string, allFiles: any, allFolders: any) {
  const files = await client.list(dir);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = dir + '/' + file.name;
    if (file.isDirectory) {
      allFolders[filePath] = file;
      await collectRemoteFiles(client, filePath, allFiles, allFolders);
    } else {
      allFiles[filePath] = file;
    }
  }

  return allFiles;
}

async function synchronizeDistFolderWithFtpFolder() {
  const allFiles: Array<string> = [];
  const allFolders: Array<string> = [];
  collectFiles('../dist/pdf-showcase/browser', allFiles, allFolders);
  console.log(allFolders.length + ' folders');
  console.log(allFiles.length + ' files');
  const client = new ftp.Client();

  try {
    await client.access({
      host: process.env.ftphost,
      user: process.env.ftpuser,
      password: process.env.ftppassword,
      secure: true,
    });

    const allRemoteFiles = {};
    const allRemoteFolders = {};
    console.log("Collecting the remote files (this takes 1-2 minutes)");
    await collectRemoteFiles(client, remoteRootFolder, allRemoteFiles, allRemoteFolders);
    console.log('--------');
    console.log(Object.keys(allRemoteFolders).length + ' remote folders');
    console.log(allFolders.length + ' local folders');
    console.log(Object.keys(allRemoteFiles).length + ' remote files');
    console.log(allFiles.length + ' local files');

    console.log('--------');

    await client.cd(remoteRootFolder);
    let i = 0;

    for (let folder of allFolders) {
      const remoteFolder = folder.replace('../dist/pdf-showcase/browser', remoteRootFolder);
      if (!allRemoteFolders[remoteFolder]) {
        console.log(i++ + ' Creating folder ' + remoteFolder);
        await client.ensureDir(remoteFolder);
      }
    }

    await client.cd(remoteRootFolder);
    i = 0;
    for (let file of allFiles) {
      const remoteFile = file.replace('../dist/pdf-showcase/browser', remoteRootFolder);
      try {
        if (allRemoteFiles[remoteFile]) {
          const info = fs.statSync(file);
          const remoteInfo = allRemoteFiles[remoteFile] as ftp.FileInfo;
          if (info.size === remoteInfo.size && !file.includes(".html")) {
            // console.log("Skipping " + remoteFile);
          } else {
            // console.log("Different size");
            console.log(i++ + ' of ' + allFiles.length + ' Uploading (updated)' + remoteFile);
            await client.uploadFrom(file, remoteFile);
          }
        } else {
          console.log(i++ + ' of ' + allFiles.length + ' Uploading (new)  ' + remoteFile);
          await client.uploadFrom(file, remoteFile);
        }
      } catch (exception) {
        console.log("Couldn't upload " + file);
        console.log(exception);
      }
    }

    for (let remoteFile of Object.keys(allRemoteFiles)) {
      if (remoteFile) {
        if (!remoteFile.includes(".htaccess")) {
          const localFile = remoteFile.replace(remoteRootFolder, '../dist/pdf-showcase/browser');
          if (!allFiles.includes(localFile)) {
            console.log("delete " + remoteFile);
          }
        }
      }
    }
    for (let remoteFolder of Object.keys(allRemoteFolders)) {
      if (remoteFolder) {
        const localFolder = remoteFolder.replace(remoteRootFolder, '../dist/pdf-showcase/browser');
        if (!allFolders.includes(localFolder)) {
          console.log("delete " + remoteFolder);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
  client.close();
}
