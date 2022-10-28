import axios from "axios";
import { CheerioAPI, load } from "cheerio";
import { pipe } from "fp-ts/lib/function";
import { get } from "spectacles-ts";

const BASE_URL = "https://www.imdb.com";
let url1 = "/search/title/?groups=top_250&sort=user_rating";

type Movie = {
  title: string;
  rank: string;
  runtime: string;
  genre: string;
  ratings: string;
  metascore: string;
  plot: string;
  director: string;
  stars: string[];
};

async function scrapeData() {
  const { data } = await axios.get(`${BASE_URL}${url1}`);
  const $ = load(data);
  // console.log($("#main .article .desc").children("a").attr("href"));
  const ratingList = $(".lister-list .lister-item.mode-advanced");
  const movies: Movie[] = [];
  ratingList.each((_idx, el) => {
    const movie: Movie = {
      title: "",
      rank: "",
      runtime: "",
      genre: "",
      ratings: "",
      metascore: "",
      plot: "",
      director: "",
      stars: [],
    };
    const movieContentEl = $(el).children(".lister-item-content");
    movie.title = movieContentEl.children("h3").children("a").text();
    movie.rank = movieContentEl
      .children("h3")
      .children("span")
      .eq(0)
      .text()
      .trim()
      .replace(".", "");
    movie.runtime = movieContentEl
      .children(".text-muted")
      .children(".runtime")
      .text();
    movie.genre = movieContentEl
      .children(".text-muted")
      .children(".genre")
      .text()
      .trim()
      .replace("\n", "");
    movie.ratings =
      movieContentEl
        .children(".ratings-bar")
        .children(".ratings-imdb-rating")
        .attr("data-value") ?? "";
    movie.metascore = movieContentEl
      .children(".ratings-bar")
      .children(".ratings-metascore")
      .children("span")
      .text()
      .trim();
    movie.plot = movieContentEl
      .children(".text-muted")
      .eq(1)
      .text()
      .trim()
      .replace("\n", "");
    movie.director = movieContentEl
      .children("p")
      .eq(2)
      .children("a")
      .eq(0)
      .text();
    //   const dob = await getDirectorDetails(
    //     movieContentEl.children("p").eq(2).children("a").eq(0).attr("href")
    //   );
    //   console.log(dob);
    const stars = movieContentEl.children("p").eq(2).children("a");
    movie.stars = stars
      .map((idx: number) => {
        if (idx > 0) {
          return $(stars[idx]).text();
        }
      })
      .toArray();
    movies.push(movie);
  });
  // console.dir(movies);
  return movies;
}

scrapeData().then((res) => {
  console.log(pipe(res, get("[]>.rank")));
});
