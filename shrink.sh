#!/bin/bash
find uploads/ -type f -iname "*" ! -iname '*~' -print -exec mogrify -resize 400x {} + 
