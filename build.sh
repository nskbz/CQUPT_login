
#Compile
npx tsc -b || { echo "there is no npm!"; exit 1; }

echo "compile over!"

#Merge
#1.merge-backend
rm -rf dist
mkdir -p dist/src
#copy a piece of share for backend
mkdir -p dist/share
cp src/dist/*.js dist/src/
cp share/dist/*.js dist/share/

#2.merge-frontend
cp -r public dist/
mkdir -p dist/public/ui
#copy a piece of share for frontend
mkdir -p dist/public/share

cp ui/dist/*.js dist/public/ui/
cp share/dist/*.js dist/public/share/

echo "merge over!"

#Clean
rm -rf src/dist
rm -rf ui/dist
rm -rf share/dist

echo "clean over!"
