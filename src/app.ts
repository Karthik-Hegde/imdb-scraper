import axios from "axios";
import { load } from "cheerio";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { get, modify, modifyW, set } from "spectacles-ts";

const BASE_URL = "https://www.imdb.com";
let url = "/search/title/?groups=top_250&sort=user_rating";

type Movie = {
  title: string;
  rank: string | number;
  runtime: string;
  genre: string;
  ratings: string | number;
  metascore: string;
  plot: string;
  director: string;
  stars: string[];
};

async function scrapeData() {
  const { data } = await axios.get(`${BASE_URL}${url}`);
  const $ = load(data);
  const movieList = $(".lister-list .lister-item.mode-advanced");
  const movies: Movie[] = [];
  movieList.each((_idx, el) => {
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
  return movies;
}

const log = (s: string) => (data: unknown) => {
  console.log(`\n\n${s}: `);
  console.log(data);
  return data;
};

// Function to display only directors name from scraped data
const displayDirectors = async () => {
  const top50 = await scrapeData();
  pipe(top50, get("[]>.director"), log("Directors"));
};

displayDirectors();

// Function to set runtime of 3rd item from 152 mins to 153 mins
const setRuntime = async () => {
  const top50 = await scrapeData();
  pipe(
    top50.slice(0, 10),
    set("[number].runtime", 2, "153 min"),
    log("Modifided runtime")
  );
};

setRuntime();

// Function to convert first ratings value from string to number from scraped data using modify function
const convertRatingToNumber = async () => {
  const top50 = await scrapeData();
  pipe(
    top50,
    modify("[number].ratings", 0, (rating) => parseFloat(rating.toString())),
    get("[number].ratings", 0),
    O.toNullable,
    log("Rating of first movie")
  );
};

convertRatingToNumber();

const convertAllRankToNumber = async () => {
  const top50 = await scrapeData();
  pipe(
    top50,
    modifyW("[]>.rank", (rank) => parseFloat(rank.toString())),
    get("[]>.rank"),
    log("Ranks converted to number")
  );
};

convertAllRankToNumber();
