#!/bin/bash

cd $(dirname $0)
cd ..

ssh lemkepi bash -c 'cd /home/lemke/code/lemke-home/ && git pull'
rsync -r --exclude node_modules/ config lemkepi:/home/lemke/code/lemke-home/config
ssh lemkepi bash -c '/home/lemke/code/lemke-home/script/setup.sh'