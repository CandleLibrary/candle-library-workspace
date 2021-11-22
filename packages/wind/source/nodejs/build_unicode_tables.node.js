import URL from "@candlelib/uri";

async function start() {

	await URL.server();

	const url = new URL("http://unicode.org/Public/12.0.0/ucd/UnicodeData.txt");

	const data = await url.fetchText();
	/* https://unicode.org/Public/8.0.0/ucd/UCD.html */
	//split the data up into lines
	const db = data
		.split("\n")
		.map(str => str.split(";"))
		.map((a, i) => ({
			i: a[0],
			ai: i,
			index: parseInt("0x" + a[0]),
			name: a[1],
			general: a[2],
			conanical_combining_classes: a[3],
			bidirectional: a[4],
			character_decomposition_mapping: a[5],
			decimal_digit_value: a[6],
			digit_value: a[7],
			numeric_value: a[8],
			mirrod: a[9],
			unicode_1_name: a[10],
			$10646_comment_field: a[11],
			uppercase_mapping: a[12],
			lowercase_mapping: a[13],
			titlecase_mapping: a[14]
		}));

	const id_start_list = "Ll:Lu:Lt:Lm:Lo:Nl";
	const id_continue_list = "Mn:Mc:Nd:Pc";
	const id_start = db.filter(o => (id_start_list).includes(o.general));
	const id_continue = db.filter(o => (id_continue_list).includes(o.general));


	function getRangesAndSingles(list) {
		//Combine list into a set of ranges
		const ranges = [];

		let fi = 0,
			li = -Infinity;

		for (let i = 0; i < list.length; i++) {
			const ind = list[i].index;
			if (ind - li > 1) {
				ranges.push([fi, li]);
				fi = ind;
			}
			li = ind;
		}

		ranges.splice(0, 1);

		return { singles: ranges.filter(r => r[0] === r[1]).map(r => r[0]), ranges: ranges.filter(r => r[0] !== r[1]).flat() };
	}

	const start_results = getRangesAndSingles(id_start);
	const continue_results = getRangesAndSingles(id_continue);


	const table = [];

	function hex(v) {
		return v; //"0x"+v.toString(16);
	}

	console.log(`const uni_id_start=[${start_results.singles.map(hex).join(",")}]\n`);
	console.log(`const uni_id_start_r=[${start_results.ranges.map(hex).join(",")}]\n`);
	console.log(`const uni_id_cont=[${continue_results.singles.map(hex).join(",")}]\n`);
	console.log(`const uni_id_cont_r=[${continue_results.ranges.map(hex).join(",")}]\n`);
}

start();