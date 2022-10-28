let urls: string[] = [];
// const getAllUrls = async (url: string) => {
//   console.log(url);
//   if (urls.includes(url)) {
//     console.log(urls);
//     return "";
//   }
//   axios.get(`${BASE_URL}${url}`).then((res) => {
//     const $ = load(res.data);
//     urls.push(url);
//     return getAllUrls(
//       $("#main .article .desc").children("a").eq(1).attr("href") ?? ""
//     );
//   });
// };

const getAllUrls = async (url: string) => {
  console.log(url);
  if (urls.includes(url)) {
    console.log(urls);
    return "";
  }
  axios.get(`${BASE_URL}${url}`).then((res) => {
    const $ = load(res.data);
    scrapeData($);
    urls.push(url);
    return getAllUrls(
      $("#main .article .desc").children("a").eq(1).attr("href") ?? ""
    );
  });
};

getAllUrls(url1);

async function getDirectorDetails(url: string) {
  try {
    const { data } = await axios.get(`${BASE_URL}${url}`);
    const $ = load(data);
    const dob = $("#name-born-info").children("time").attr("datetime");
    return { dob };
  } catch (error) {}
}
