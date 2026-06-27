fetch('https://www.youtube.com/@CanvaViagem/videos').then(r=>r.text()).then(t => {
  const regex = /"videoId":"([^"]+)","title":\{"runs":\[\{"text":"([^"]+)"/g;
  let match;
  while((match = regex.exec(t)) !== null) {
    console.log(match[1], match[2]);
  }
});
