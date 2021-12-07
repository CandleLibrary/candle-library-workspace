import CSS_Color from "../types/color.js";
import CSS_Length from "../types/length.js";
import CSS_Percentage from "../types/percentage.js";
import CSS_URL from "../types/url.js";
import CSS_String from "../types/string.js";
import CSS_Id from "../types/id.js";
import CSS_Shape from "../types/shape.js";
import CSS_Number from "../types/number.js";
import CSS_Bezier from "../types/cubic_bezier.js";
import { CSS_Gradient } from "../types/gradient.js";
import CSS_Media_handle from "../types/media.js";
import { CSS_Transform2D, CSS_Transform3D } from "../types/transform.js";
import CSS_Path from "../types/path.js";
import CSS_FontName from "../types/font_name.js";
import CSS_Rectangle from "../types/rectangle.js";

/**
 * CSS Type constructors
 */
export const types = {
	color: CSS_Color,
	flex: CSS_Length,
	length_: CSS_Length,
	time_: CSS_Length,
	angle_: CSS_Length,
	frequency_: CSS_Length,
	percentage_: CSS_Percentage,
	number_: CSS_Number,
	integer_: CSS_Number,
	resolution: CSS_Length,
	url: CSS_URL,
	uri: CSS_URL,
	image: CSS_URL,
	id: CSS_Id,
	string: CSS_String,
	shape: CSS_Shape,
	cubic_bezier: CSS_Bezier,
	gradient: CSS_Gradient,
	linear_gradient: CSS_Gradient,
	transform3D: CSS_Transform3D,
	transform2D: CSS_Transform2D,
	path: CSS_Path,
	rect: CSS_Rectangle,
	fontname: CSS_FontName,

	/* Media parsers */
	m_width: CSS_Media_handle("w", 0),
	m_min_width: CSS_Media_handle("w", 1),
	m_max_width: CSS_Media_handle("w", 2),
	m_height: CSS_Media_handle("h", 0),
	m_min_height: CSS_Media_handle("h", 1),
	m_max_height: CSS_Media_handle("h", 2),
	m_device_width: CSS_Media_handle("dw", 0),
	m_min_device_width: CSS_Media_handle("dw", 1),
	m_max_device_width: CSS_Media_handle("dw", 2),
	m_device_height: CSS_Media_handle("dh", 0),
	m_min_device_height: CSS_Media_handle("dh", 1),
	m_max_device_height: CSS_Media_handle("dh", 2)
};

/**
 * CSS Property Definitions https://www.w3.org/TR/css3-values/#value-defs
 */
export const property_definitions = {

	/* https://drafts.csswg.org/css-writing-modes-3/ */
	direction: "ltr|rtl",
	unicode_bidi: "normal|embed|isolate|bidi-override|isolate-override|plaintext",
	writing_mode: "horizontal-tb|vertical-rl|vertical-lr",
	text_orientation: "mixed|upright|sideways",
	glyph_orientation_vertical: `auto|0deg|90deg|0|90`,
	text_combine_upright: "none|all",

	/* https://www.w3.org/TR/css-position-3 */
	position: "static|relative|absolute|sticky|fixed",
	top: `<length>|<percentage>|<number>|auto`,
	left: `<length>|<percentage>|<number>|auto`,
	bottom: `<length>|<percentage>|<number>|auto`,
	right: `<length>|<percentage>|<number>|auto`,
	offset_before: `<length>|<percentage>|auto`,
	offset_after: `<length>|<percentage>|auto`,
	offset_start: `<length>|<percentage>|auto`,
	offset_end: `<length>|<percentage>|auto`,
	z_index: "auto|<integer>",

	/* https://www.w3.org/TR/css-display-3/ */
	display: `[ <display_outside> || <display_inside> ] | <display_listitem> | <display_internal> | <display_box> | <display_legacy>`,

	/* https://drafts.fxtf.org/filter-effects-1/ */
	filter: `none|<filter_value_list>`,
	filter_value_list: `[<filter_function>|<url>]+`,
	filter_function: `<blur()>|<brightness()>|<contrast()>|<drop-shadow()>|<grayscale()>|<hue_rotate()>|<invert()>|<opacity()>|<sepia()>|<saturate()>`,

	/* https://drafts.fxtf.org/filter-effects-2/#BackdropFilterProperty */
	backdrop_filter: `<filter_value_list>`,

	/* https://www.w3.org/TR/css-box-3 */
	margin: `[ <length> | <percentage> | 0 | auto ]{1,4}`,
	margin_top: `<length>|<percentage>|0|auto`,
	margin_right: `<length>|<percentage>|0|auto`,
	margin_bottom: `<length>|<percentage>|0|auto`,
	margin_left: `<length>|<percentage>|0|auto`,

	margin_trim: "none|in-flow|all",

	padding: `[<length>|<percentage>|0|auto]{1,4}`,
	padding_top: `<length>|<percentage>|0|auto`,
	padding_right: `<length>|<percentage>|0|auto`,
	padding_bottom: `<length>|<percentage>|0|auto`,
	padding_left: `<length>|<percentage>|0|auto`,

	/* https://www.w3.org/TR/CSS2/visuren.html */
	float: `left|right|none`,
	clear: `left|right|both|none`,

	/* https://drafts.csswg.org/css-sizing-3 todo:implement fit-content(%) function */
	box_sizing: `content-box | border-box`,
	width: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
	height: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
	min_width: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
	max_width: `<length>|<percentage>|min-content|max-content|fit-content|auto|none`,
	min_height: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
	max_height: `<length>|<percentage>|min-content|max-content|fit-content|auto|none`,

	/* https://www.w3.org/TR/2018/REC-css-color-3-20180619 */
	color: `<color>|<gradient>`,
	opacity: `<alphavalue>`,

	/* https://www.w3.org/TR/css-backgrounds-3/ */
	background_color: `<color>`,
	background_image: `<bg_image>#`,
	background_repeat: `<repeat_style>#`,
	background_attachment: `scroll|fixed|local`,
	background_position: `<background_position_x>||<background_position_y>`,
	background_position_x: `<length_percentage>|left|center|right`,
	background_position_y: `<length_percentage>|top|center|bottom`,
	background_clip: `<box>#|text`,
	background_origin: `<box>#`,
	background_size: `<bg_size>#`,

	// This should be [<bg_layer># ,]?<final_bg_layer>
	// but the current parser generator can't handle
	// the trailing comma; This close enough solution
	// will have to be good enough.
	background: `<final_bg_layer>#`,
	border_color: `<color>{1,4}`,
	border_top_color: `<color>`,
	border_right_color: `<color>`,
	border_bottom_color: `<color>`,
	border_left_color: `<color>`,

	border_top_width: `<line_width>`,
	border_right_width: `<line_width>`,
	border_bottom_width: `<line_width>`,
	border_left_width: `<line_width>`,
	border_width: `<line_width>{1,4}`,

	border_style: `<line_style>{1,4}`,
	border_top_style: `<line_style>`,
	border_right_style: `<line_style>`,
	border_bottom_style: `<line_style>`,
	border_left_style: `<line_style>`,

	border_top: `<line_width>||<line_style>||<color>`,
	border_right: `<line_width>||<line_style>||<color>`,
	border_bottom: `<line_width>||<line_style>||<color>`,
	border_left: `<line_width>||<line_style>||<color>`,

	border_radius: `<length_percentage>{1,4}`,
	border_top_left_radius: `<length_percentage>{1,2}`,
	border_top_right_radius: `<length_percentage>{1,2}`,
	border_bottom_right_radius: `<length_percentage>{1,2}`,
	border_bottom_left_radius: `<length_percentage>{1,2}`,

	border: `<line_width>||<line_style>||<color>|none`,

	border_image: `<border_image_source>||<border_image_slice>[/<border_image_width>|/<border_image_width>?/<border_image_outset>]?||<border_image_repeat>`,
	border_image_source: `none|<image>`,
	border_image_slice: `[<number>|<percentage>]{1,4}&&fill?`,
	border_image_width: `[<length_percentage>|<number>|auto]{1,4}`,
	border_image_outset: `[<length>|<number>]{1,4}`,
	border_image_repeat: `[stretch|repeat|round|space]{1,2}`,
	box_shadow: `none|<shadow>#`,
	line_height: `normal|<percentage>|<length>|<number>`,
	overflow_x: 'visible|hidden|scroll|auto',
	overflow_y: 'visible|hidden|scroll|auto',
	overflow: 'visible|hidden|scroll|auto',

	/* https://www.w3.org/TR/css-fonts-4 */
	font_display: "auto|block|swap|fallback|optional",
	font_family: `[<generic_family>|<family_name>]#`,
	font_language_override: "normal|<string>",
	font: `[[<font_style>||<font_variant>||<font_weight>]?<font_size>[/<line_height>]?<font_family>]|caption|icon|menu|message-box|small-caption|status-bar`,
	font_max_size: `<absolute_size>|<relative_size>|<length>|<percentage>|infinity`,
	font_min_size: `<absolute_size>|<relative_size>|<length>|<percentage>`,
	font_optical_sizing: `auto|none`,
	font_pallette: `normal|light|dark|<identifier>`,
	font_size: `<absolute_size>|<relative_size>|<length>|<percentage>`,
	font_stretch: "<percentage>|normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded",
	font_style: `normal|italic|oblique<angle>?`,
	font_synthesis: "none|[weight||style]",
	font_synthesis_small_caps: "auto|none",
	font_synthesis_style: "auto|none",
	font_synthesis_weight: "auto|none",
	font_variant_alternates: "normal|[stylistic(<feature-value-name>)||historical-forms||styleset(<feature-value-name>#)||character-variant(<feature-value-name>#)||swash(<feature-value-name>)||ornaments(<feature-value-name>)||annotation(<feature-value-name>)]",
	font_variant_emoji: "auto|text|emoji|unicode",
	font_variation_settings: " normal|[<string><number>]#",
	font_size_adjust: `<number>|none`,

	font_weight: `normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900`,

	/* https://www.w3.org/TR/css-fonts-3/ */
	font_kerning: ` auto | normal | none`,
	font_variant: `normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>||[small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps]||<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero||<east-asian-variant-values>||<east-asian-width-values>||ruby||[sub|super]]`,
	font_variant_ligatures: `normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values> ]`,
	font_variant_position: `normal|sub|super`,
	font_variant_caps: `normal|small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps`,
	font_variant_numeric: "normal | [ <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero ]",
	font_variant_east_asian: " normal | [ <east-asian-variant-values> || <east-asian-width-values> || ruby ]",

	/* https://drafts.csswg.org/css-text-3 */
	hanging_punctuation: "none|[first||[force-end|allow-end]||last]",
	hyphens: "none|manual|auto",
	letter_spacing: `normal|<length>`,
	line_break: "auto|loose|normal|strict|anywhere",
	overflow_wrap: "normal|break-word|anywhere",
	tab_size: "<length>|<number>",
	text_align: "start|end|left|right|center|justify|match-parent|justify-all",
	text_align_all: "start|end|left|right|center|justify|match-parent",
	text_align_last: "auto|start|end|left|right|center|justify|match-parent",
	text_indent: "[[<length>|<percentage>]&&hanging?&&each-line?]",
	text_justify: "auto|none|inter-word|inter-character",
	text_transform: "none|[capitalize|uppercase|lowercase]||full-width||full-size-kana",
	white_space: "normal|pre|nowrap|pre-wrap|break-spaces|pre-line",
	word_break: " normal|keep-all|break-all|break-word",
	word_spacing: "normal|<length>",
	word_wrap: "  normal | break-word | anywhere",

	/* https://drafts.csswg.org/css-text-decor-3 */
	text_decoration: "<text-decoration-line>||<text-decoration-style>||<color>",
	text_decoration_color: "<color>",
	text_decoration_line: "none|[underline||overline||line-through||blink]",
	text_decoration_style: "solid|double|dotted|dashed|wavy",
	text_emphasis: "<text-emphasis-style>||<text-emphasis-color>",
	text_emphasis_color: "<color>",
	text_emphasis_position: "[over|under]&&[right|left]?",
	text_emphasis_style: "none|[[filled|open]||[dot|circle|double-circle|triangle|sesame]]|<string>",
	text_shadow: "none|[<color>?&&<length>{2,3}]#",
	text_underline_position: "auto|[under||[left|right]]",

	/* Flex Box https://www.w3.org/TR/css-flexbox-1/ */
	align_content: `flex-start | flex-end | center | space-between | space-around | stretch`,
	align_items: `flex-start | flex-end | center | baseline | stretch`,
	align_self: `auto | flex-start | flex-end | center | baseline | stretch`,
	flex: `none|[<flex-grow> <flex-shrink>?||<flex-basis>]`,
	flex_basis: `content|<width>`,
	flex_direction: `row | row-reverse | column | column-reverse`,
	flex_flow: `<flex-direction>||<flex-wrap>`,
	flex_grow: `<number>`,
	flex_shrink: `<number>`,
	flex_wrap: `nowrap|wrap|wrap-reverse`,
	justify_content: "flex-start | flex-end | center | space-between | space-around | space-evenly",
	justify_items: "auto|normal | stretch | flex-start | flex-end | center | self-start | self-end | left | right | end | start",
	order: `<integer>`,

	/* https://drafts.csswg.org/css-transitions-1/ */
	transition: `<single_transition>#`,
	transition_delay: `<time>#`,
	transition_duration: `<time>#`,
	transition_property: `none|<single_transition_property>#`,
	transition_timing_function: `<timing_function>#`,

	/* CSS3 Animation https://drafts.csswg.org/css-animations-1/ */
	animation: `<single_animation>#`,
	animation_name: `[none|<keyframes_name>]#`,
	animation_duration: `<time>#`,
	animation_timing_function: `<timing_function>#`,
	animation_iteration_count: `<single_animation_iteration_count>#`,
	animation_direction: `<single_animation_direction>#`,
	animation_play_state: `<single_animation_play_state>#`,
	animation_delayed: `<time>#`,
	animation_fill_mode: `<single_animation_fill_mode>#`,

	/* https://svgwg.org/svg2-draft/interact.html#PointerEventsProperty */
	pointer_events: `visiblePainted|visibleFill|visibleStroke|visible|painted|fill|stroke|all|none|auto`,
	//https://developer.mozilla.org/en-US/docs/Web/CSS/user-select
	user_select: "none|auto|text|contain|all",

	/* https://drafts.csswg.org/css-ui-3 */
	caret_color: "auto|<color>",
	cursor: "[[<url> [<number><number>]?,]*[auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|text|vertical-text|alias|copy|move|no-drop|not-allowed|grab|grabbing|e-resize|n-resize|ne-resize|nw-resize|s-resize|se-resize|sw-resize|w-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|col-resize|row-resize|all-scroll|zoom-in|zoom-out]]",
	outline: "[<outline-color>||<outline-style>||<outline-width>]",
	outline_color: "<color>|invert",
	outline_offset: "<length>",
	outline_style: "auto|<border-style>",
	outline_width: "<line-width>",
	resize: "none|both|horizontal|vertical",
	text_overflow: "clip|ellipsis",

	/* https://drafts.csswg.org/css-content-3/ */
	bookmark_label: "<content-list>",
	bookmark_level: "none|<integer>",
	bookmark_state: "open|closed",
	quotes: "none|[<string><string>]+",
	string_set: "none|[<custom-ident><string>+]#",

	/*https://www.w3.org/TR/CSS22/tables.html*/
	caption_side: "top|bottom",
	table_layout: "auto|fixed",
	border_collapse: "collapse|separate",
	border_spacing: "<length><length>?",
	empty_cells: "show|hide",

	/* https://www.w3.org/TR/CSS2/page.html */
	page_break_before: "auto|always|avoid|left|right",
	page_break_after: "auto|always|avoid|left|right",
	page_break_inside: "auto|avoid|left|right",
	orphans: "<integer>",
	widows: "<integer>",

	/* https://drafts.csswg.org/css-lists-3 */
	counter_set: "[<custom-ident> <integer>?]+|none",
	list_style: "<list-style-type>||<list-style-position>||<list-style-image>",
	list_style_image: "<url>|none",
	list_style_position: "inside|outside",
	list_style_type: "<counter-style>|<string>|none",
	marker_side: "list-item|list-container",


	vertical_align: `baseline|sub|super|top|text-top|middle|bottom|text-bottom|<percentage>|<length>`,

	/* Transform */
	transform: "<transform2D>|none",
	perspective: "<length>|none",
	perspective_origin: "<position>",
	transform_origin: "[<length-percentage>|left|center|right|top|bottom]|[[<length-percentage>|left|center|right]&&[<length-percentage>|top|center|bottom]]<length>?",
	transform_style: "flat|preserve-3d",


	/* Visual Effects */
	visibility: `visible|hidden|collapse`,
	content: `normal|none|[<string>|<uri>|<counter>|attr(<id>)|open-quote|close-quote|no-open-quote|no-close-quote]+`,
	quotas: `[<string><string>]+|none`,
	counter_reset: `[<identifier><integer>?]+|none`,
	counter_increment: `[<identifier><integer>?]+|none`,

	/* https://drafts.csswg.org/css-grid-2/ */
	grid: "<grid-template>|<grid-template-rows>/[auto-flow && dense?]<grd-auto-columns>?|[auto-flow && dense?]<grid-auto-rows>?/<grid-template-columns>",
	grid_area: "<grid-line>[/<grid-line>]{0,3}",
	grid_auto_columns: "<track-size>+",
	grid_auto_rows: "<track-size>+",
	grid_auto_flow: "[row|column]||dense",
	grid_column: "<grid-line>[/<grid-line>]?",
	grid_column_end: "<grid-line>",
	grid_column_start: "<grid-line>",
	grid_row: "<grid-line>[/<grid-line>]?",
	grid_row_end: "<grid-line>",
	grid_row_start: "<grid-line>",
	grid_template: "none | [ <grid-template-rows> / <grid-template-columns> ] | [ <line-names>? <string> <track-size>? <line-names>? ]+ [ / <explicit-track-list> ]?",
	grid_template_areas: "none | <string>+",
	grid_template_columns: "none|<track-list>|<auto-track-list>|subgrid <line-name-list>?",
	grid_template_rows: "none | <track-list> | <auto-track-list> | subgrid <line-name-list>?",

	/* 
		CSS Masking Module Level 1 
		https://drafts.fxtf.org/css-masking-1/
	*/
	clip: '<rect>|auto',


};

/* Properties that are not directly accessible by CSS prop creator */

export const virtual_property_definitions = {

	calc: "calc(<calc_sum>)",
	/* https://drafts.csswg.org/css-counter-styles-3 */
	/*system:`cyclic|numeric|alphabetic|symbolic|additive|[fixed<integer>?]|[extends<counter-style-name>]`,
	negative:`<symbol><symbol>?`,
	prefix:`<symbol>`,
	suffix:`<symbol>`,
	range:`[[<integer>|infinite]{2}]#|auto`,
	pad:`<integer>&&<symbol>`,
	fallback:`<counter-style-name>`
	symbols:`<symbol>+`,*/

	/* https://drafts.csswg.org/css-grid-2/ */
	grid_line: "auto|<custom-ident>|[<integer>&&<custom-ident>?]|[span&&[<integer>||<custom-ident>]]",
	track_list: "[<line-names>?[<track-size>|<track-repeat>]]+<line-names>?",
	auto_track_list: "[<line-names>?[<fixed-size>|<fixed-repeat>]]*<line-names>?<auto-repeat>",
	explicit_track_list: "[<line-names>?<track-size>]+<line-names>?",
	line_name_list: "[<line-names>|<name-repeat>]+",
	track_size: "<track-breadth>|minmax(<inflexible-breadth>,<track-breadth>)|fit-content(<length-percentage>)",
	fixed_size: "<fixed-breadth>|minmax(<fixed-breadth>,<track-breadth>)|minmax(<inflexible-breadth>,<fixed-breadth>)",
	track_breadth: " <length-percentage> | <flex> | min-content | max-content | auto",
	inflexible_breadth: "<length-percentage> | min-content | max-content | auto",
	fixed_breadth: "<length-percentage>",
	line_names: "[<custom-ident>*]",
	track_repeat: "repeat",//( [ <integer [1,∞]> ] , [ <line-names>? <track-size> ]+ <line-names>? )",
	auto_repeat: "repeat",//( [ auto-fill | auto-fit ] , [ <line-names>? <fixed-size> ]+ <line-names>? )",
	fixed_repeat: "repeat",//( [ <integer [1,∞]> ] , [ <line-names>? <fixed-size> ]+ <line-names>? )",
	name_repeat: "repeat",//( [ <integer [1,∞]> | auto-fill ], <line-names>+)",

	counter_style: `<numeric_counter_style>|<alphabetic_counter_style>|<symbolic_counter_style>|<japanese_counter_style>|<korean_counter_style>|<chinese_counter_style>|ethiopic-numeric`,
	numeric_counter_style: `decimal|decimal-leading-zero|arabic-indic|armenian|upper-armenian|lower-armenian|bengali|cambodian|khmer|cjk-decimal|devanagari|georgian|gujarati|gurmukhi|hebrew|kannada|lao|malayalam|mongolian|myanmar|oriya|persian|lower-roman|upper-roman|tamil|telugu|thai|tibetan`,
	symbolic_counter_style: `disc|circle|square|disclosure-open|disclosure-closed`,
	alphabetic_counter_style: `lower-alpha|lower-latin|upper-alpha|upper-latin|cjk-earthly-branch|cjk-heavenly-stem|lower-greek|hiragana|hiragana-iroha|katakana|katakana-iroha`,
	japanese_counter_style: `japanese-informal|japanese-formal`,
	korean_counter_style: `korean-hangul-formal|korean-hanja-informal|and korean-hanja-formal`,
	chinese_counter_style: `simp-chinese-informal|simp-chinese-formal|trad-chinese-informal|and trad-chinese-formal`,

	/* https://drafts.csswg.org/css-conte-3/ */
	content_list: "[<string>|contents|<image>|<quote>|<target>|<leader()>]+",
	content_replacement: "<image>",

	/* https://drafts.csswg.org/css-values-4 */
	position: "[[left|center|right]||[top|center|bottom]|[left|center|right|<length-percentage>][top|center|bottom|<length-percentage>]?|[[left|right]<length-percentage>]&&[[top|bottom]<length-percentage>]]",

	/* https://drafts.csswg.org/css-lists-3 */

	east_asian_variant_values: "[jis78|jis83|jis90|jis04|simplified|traditional]",

	alphavalue: '<number>',

	box: `border-box|padding-box|content-box`,

	/*Font-Size: www.w3.org/TR/CSS2/fonts.html#propdef-font-size */
	absolute_size: `xx-small|x-small|small|medium|large|x-large|xx-large`,
	relative_size: `larger|smaller`,

	/*https://www.w3.org/TR/css-backgrounds-3/#property-index*/

	//bg_layer: `<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
	final_bg_layer: `<background_color>||<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
	bg_image: `<url>|<gradient>|none`,
	repeat_style: `repeat-x|repeat-y|[repeat|space|round|no-repeat]{1,2}`,
	background_attachment: `<attachment>#`,
	bg_size: `[<length_percentage>|auto]{1,2}|cover|contain`,
	bg_position: `[top|center|bottom|<percentage>|<length>]||[left|center|right|<percentage>|<length>]`,
	attachment: `scroll|fixed|local`,
	line_style: `none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset`,
	line_width: `thin|medium|thick|<length>`,
	shadow: `inset?<length>{2,4}&&<color>?`,

	/* Font https://www.w3.org/TR/css-fonts-4/#family-name-value */

	family_name: `<fontname>`,
	generic_family: `serif|sans-serif|cursive|fantasy|monospace`,

	/* Identifier https://drafts.csswg.org/css-values-4/ */

	identifier: `<id>`,
	custom_ident: `<id>`,

	/* https://drafts.csswg.org/css-timing-1/#typedef-timing-function */

	timing_function: `linear|<cubic_bezier_timing_function>|<step_timing_function>|<frames_timing_function>`,
	cubic_bezier_timing_function: `<cubic_bezier>`,
	step_timing_function: `step-start|step-end|'steps()'`,
	frames_timing_function: `'frames()'`,

	/* https://drafts.csswg.org/css-transitions-1/ */

	single_animation_fill_mode: `none|forwards|backwards|both`,
	single_animation_play_state: `running|paused`,
	single_animation_direction: `normal|reverse|alternate|alternate-reverse`,
	single_animation_iteration_count: `infinite|<number>`,
	single_transition_property: `all|<custom_ident>`,
	single_transition: `[none|<single_transition_property>]||<time>||<timing_function>||<time>`,

	/* CSS3 Animation https://drafts.csswg.org/css-animations-1/ */

	single_animation: `<time>||<timing_function>||<time>||<single_animation_iteration_count>||<single_animation_direction>||<single_animation_fill_mode>||<single_animation_play_state>||[none|<keyframes_name>]`,
	keyframes_name: `<string>`,



	/* CSS3 Stuff */
	time: "<time_>|<calc>",
	angle: "<angle_>|<calc>",
	frequency: "<frequency_>|<calc>",
	length: "<length_>|<calc>",
	percentage: "<percentage_>|<calc>",
	number: "<number_>|<calc>",
	integer: "<integer_>|<calc>",
	length_percentage: `<length>|<percentage>`,
	frequency_percentage: `<frequency>|<percentage>`,
	angle_percentage: `<angle>|<percentage>`,
	time_percentage: `<time>|<percentage>`,
	number_percentage: `<percentage>|<number>`,

	/*CSS Clipping https://www.w3.org/TR/css-masking-1/#clipping */
	clip_path: `<clip_source>|[<basic_shape>||<geometry_box>]|none`,
	clip_source: `<url>`,
	shape_box: `<box>|margin-box`,
	geometry_box: `<shape_box>|fill-box|stroke-box|view-box`,
	basic_shape: `<CSS_Shape>`,
	ratio: `<integer>/<integer>`,

	/* https://www.w3.org/TR/css-fonts-3/ */
	common_lig_values: `[ common-ligatures | no-common-ligatures ]`,
	discretionary_lig_values: `[ discretionary-ligatures | no-discretionary-ligatures ]`,
	historical_lig_values: `[ historical-ligatures | no-historical-ligatures ]`,
	contextual_alt_values: `[ contextual | no-contextual ]`,

	//Display
	display_outside: `block | inline | run-in`,
	display_inside: `flow | flow-root | table | flex | grid | ruby`,
	display_listitem: `<display_outside>? && [ flow | flow-root ]? && list-item`,
	display_internal: `table-row-group | table-header-group | table-footer-group | table-row | table-cell | table-column-group | table-column | table-caption | ruby-base | ruby-text | ruby-base-container | ruby-text-container`,
	display_box: `contents | none`,
	display_legacy: `inline-block | inline-table | inline-flex | inline-grid`,



};

export const media_feature_definitions = {
	width: "<m_width>",
	min_width: "<m_max_width>",
	max_width: "<m_min_width>",
	height: "<m_height>",
	min_height: "<m_min_height>",
	max_height: "<m_max_height>",
	orientation: "portrait  | landscape",
	aspect_ratio: "<ratio>",
	min_aspect_ratio: "<ratio>",
	max_aspect_ratio: "<ratio>",
	resolution: "<length>",
	min_resolution: "<length>",
	max_resolution: "<length>",
	scan: "progressive|interlace",
	grid: "",
	monochrome: "",
	min_monochrome: "<integer>",
	max_monochrome: "<integer>",
	color: "",
	min_color: "<integer>",
	max_color: "<integer>",
	color_index: "",
	min_color_index: "<integer>",
	max_color_index: "<integer>"
};
