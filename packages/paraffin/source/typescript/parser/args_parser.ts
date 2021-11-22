
//@ts-nocheck

import {
    ParserFramework,
    KernelParserCore,
    fillByteBufferWithUTF8FromString
} from "@candlelib/hydrocarbon";


const {
    token_production,
    init_table,
    KernelStateIterator,
    run,
    compare
} = KernelParserCore;

const token_sequence_lookup = new Uint8Array([
    45, 45, 95, 36, 34, 39, 92, 46, 48, 120, 61, 69, 101, 70, 97, 98, 99, 100, 102, 65, 66, 67, 68, 49,
    55, 50, 51, 52, 53, 54, 48, 98, 48, 79, 48, 111
]);

const token_lookup = new Uint32Array([
    536921900, 0, 256, 0, 258, 0, 51116, 0, 384, 0, 51118, 0, 768, 0, 1073792942, 0, 1280, 0, 1073792814,
    0, 49580, 0, 260, 0, 302, 0, 288, 0, 264, 0, 2432, 0, 12680, 0, 4480, 0, 8576, 0, 392, 0, 12330, 0,
    49536, 0, 16768, 0, 33152, 0, 115118, 0, 128, 0, 115116, 0, 65964, 0, 65920, 0, 428, 0, 416, 0,
    388, 0, 786818, 0, 928, 0, 1835394, 0, 4194688, 0, 386, 0, 16777600, 0, 201326976, 0, 67109248,
    0, 134218112, 0, 536922028, 0, 536871168, 0, 1073791404, 0, 1073742080, 0, 50990, 0, 300,
    0, 2147483936, 2047, 2147483904, 0, 256, 1, 256, 2, 256, 4, 256, 8, 256, 16, 256, 32, 256, 64,
    256, 128, 256, 256, 256, 512, 256, 1024, 2147484066, 2047, 256, 6144, 256, 2048, 256, 4096,
    386, 6144, 256, 522240, 256, 8192, 256, 16384, 256, 32768, 256, 65536, 256, 131072, 256, 262144,
    386, 522240, 12296, 0, 32, 0, 4194304, 0, 16777216, 0, 201326592, 0
]);

const states_buffer = new Uint32Array([
    0, 4026531840, 2164260864, 4026531841, 2147483648, 2147483649, 603979786, 603979788,
    603980491, 0, 805306368, 0, 1073742088, 805306369, 0, 2852126734, 196612, 131079, 2147483657,
    2143305733, 2155888642, 2160082947, 2151686154, 2147500046, 2147500047, 2147483650,
    603979817, 603979819, 0, 2147483650, 603979817, 603979852, 0, 2147483650, 2147483653,
    603979817, 603979887, 603979892, 0, 4026531840, 0, 805306370, 0, 2852192261, 393217, 1,
    2147483657, 2147483651, 268435456, 603979829, 603979974, 0, 4026531840, 2852126726,
    458756, 196617, 2147489801, 2143295489, 2155872258, 2147483651, 2147489802, 2147483653,
    2155872270, 2147483663, 2147483678, 603979849, 603980524, 0, 1073742608, 805306371,
    0, 4026531840, 0, 1073742360, 805306371, 0, 2852192263, 524289, 1, 2147483658, 2147483652,
    268435456, 2147483654, 603979864, 603979890, 603979974, 0, 4026531840, 2852126726, 458756,
    196617, 2147489801, 2143295489, 2155872258, 2147483651, 2147489802, 2147483653, 2155872270,
    2147483663, 2147483678, 603979884, 603980524, 0, 1073743120, 805306372, 0, 4026531840,
    0, 1073742872, 805306372, 0, 1073743368, 805306373, 0, 805306374, 0, 2852126733, 655364,
    131077, 2147502094, 2147489797, 2139095042, 2151690243, 2147502095, 2147483655, 603979914,
    0, 2147483655, 603979956, 0, 2147483655, 603979964, 0, 2147483655, 603979972, 603980056,
    0, 4026531840, 2852192259, 720897, 1, 2147483650, 268435456, 603979922, 0, 4026531840,
    2852126730, 786432, 131077, 2147495944, 2160072705, 2147483650, 2147483651, 2147483653,
    603979942, 603980558, 0, 1073743880, 805306375, 0, 268435456, 1073743888, 805306375,
    0, 4026531840, 0, 2852126727, 131072, 65538, 2147489800, 2147483649, 1073743632, 805306375,
    0, 268435456, 1073743640, 805306375, 0, 4026531840, 0, 2852192259, 851969, 1, 2147483653,
    268435456, 603979922, 0, 4026531840, 2852192259, 917505, 1, 2147483651, 268435456, 603979922,
    0, 4026531840, 805306375, 0, 2852192260, 983044, 1, 2147483659, 2147483656, 268435456,
    805306376, 0, 4026531840, 0, 2852126732, 1048580, 65539, 2147483660, 2151694339, 2147491853,
    2147483657, 603980040, 603980004, 0, 2147483657, 603980040, 603980012, 0, 2147483657,
    603980040, 603980020, 0, 4026531840, 0, 2852192259, 1114116, 1, 2147483660, 268435456,
    805306377, 0, 4026531840, 2852192259, 1179652, 1, 2147483661, 268435456, 805306377, 0,
    4026531840, 2852192259, 1245188, 1, 2147483651, 268435456, 805306377, 0, 4026531840,
    2852126724, 1310720, 131076, 2147483660, 2151677957, 2147483661, 2147483651, 268435456,
    1073743632, 805306377, 0, 4026531840, 3087008018, 2499805193, 0, 65539, 4026531840, 0,
    0, 603980040, 603980028, 0, 2499805193, 0, 65537, 4026531840, 0, 0, 2583691278, 1376260,
    131075, 4026531840, 0, 0, 2147483658, 603980068, 0, 2147483658, 603980090, 0, 2852192263,
    1441796, 1, 2147483662, 268435456, 2147483659, 603980080, 603980130, 603980112, 603980146,
    0, 4026531840, 2852192260, 1441796, 1, 2147483662, 268435456, 1073744152, 805306378,
    0, 4026531840, 0, 2852192263, 1507332, 1, 2147483663, 268435456, 2147483659, 603980102,
    603980130, 603980112, 603980146, 0, 4026531840, 2852192260, 1507332, 1, 2147483663, 268435456,
    1073744152, 805306378, 0, 4026531840, 0, 1073744392, 805306379, 0, 2852126723, 1703961,
    131077, 2164260872, 2147483653, 2147483650, 2147483651, 2147483664, 603980127, 603980146,
    0, 4026531840, 1073743632, 805306379, 0, 3087008108, 2499805195, 0, 65539, 4026531840,
    0, 0, 603980130, 603980115, 0, 2499805195, 0, 65537, 4026531840, 0, 0, 2852126740, 1769497,
    131077, 2164293640, 2147491845, 2147508226, 2147500035, 2147483664, 2147483660, 603980268,
    603980176, 0, 2147483660, 603980268, 603980198, 0, 2147483660, 603980268, 603980208,
    0, 2147483660, 603980268, 603980218, 0, 2147483660, 603980268, 603980228, 0, 4026531840,
    0, 2852192259, 1835012, 1, 2147483664, 268435456, 603980184, 0, 4026531840, 2852126724,
    1900544, 131077, 2147483656, 2147483653, 2147483650, 2151677955, 2147483655, 268435456,
    1073744400, 805306380, 0, 4026531840, 0, 2852192260, 1966084, 1, 2147483653, 268435456,
    1073744392, 805306380, 0, 4026531840, 0, 2852192260, 1245188, 1, 2147483651, 268435456,
    1073744392, 805306380, 0, 4026531840, 0, 2852192260, 2031620, 1, 2147483650, 268435456,
    1073744392, 805306380, 0, 4026531840, 0, 2852192260, 262169, 1, 2147483656, 268435456,
    1073744392, 805306380, 0, 4026531840, 0, 2852126727, 1572889, 131077, 2164267016, 2147489797,
    2147489794, 2147489795, 2147483664, 268435456, 603980254, 0, 268435456, 1073743632,
    805306380, 0, 4026531840, 2852126724, 1900544, 131077, 2147483656, 2147483653, 2147483650,
    2151677955, 2147483655, 268435456, 1073744664, 805306380, 0, 4026531840, 0, 3087008246,
    2499805196, 0, 65539, 4026531840, 0, 0, 603980268, 603980238, 0, 2499805196, 0, 65537, 4026531840,
    0, 0, 2147483664, 603980288, 603980324, 0, 2852126725, 2097156, 65539, 2147483666, 2151684097,
    2147483667, 268435456, 603980300, 0, 805306384, 0, 4026531840, 2852126727, 2162692, 65538,
    2147483657, 2143295493, 268435456, 603980314, 0, 268435456, 1073741848, 805306384, 0,
    4026531840, 0, 2852192260, 1966084, 1, 2147483653, 268435456, 1073741856, 805306384,
    0, 4026531840, 0, 2852192260, 1966084, 1, 2147483653, 2147483665, 268435456, 603980334,
    0, 4026531840, 0, 2852126725, 2228228, 131076, 2147483668, 2147489793, 2147489810, 2147489811,
    268435456, 603980348, 0, 805306385, 0, 4026531840, 0, 2852192260, 1966084, 1, 2147483653,
    268435456, 1073741848, 805306385, 0, 4026531840, 0, 2852192261, 2293764, 1, 2147483670,
    2147483667, 268435456, 603980368, 603980636, 0, 4026531840, 1073741840, 805306387, 0,
    2852192261, 2424836, 1, 2147483672, 2147483669, 268435456, 603980381, 603980874, 0, 4026531840,
    1073741840, 805306389, 0, 2583691290, 2490372, 131075, 4026531840, 0, 0, 2147483671, 603980396,
    0, 2147483671, 603980409, 0, 2852192260, 2555908, 1, 2147483674, 268435456, 603980406,
    603980934, 0, 4026531840, 0, 1073741840, 805306391, 0, 2852192260, 2621444, 1, 2147483675,
    268435456, 603980406, 603980934, 0, 4026531840, 0, 2852126732, 1048580, 65539, 2147483660,
    2151694339, 2147491853, 2147483673, 603980475, 603980439, 0, 2147483673, 603980475,
    603980447, 0, 2147483673, 603980475, 603980455, 0, 4026531840, 0, 2852192259, 1114116,
    1, 2147483660, 268435456, 805306393, 0, 4026531840, 2852192259, 1179652, 1, 2147483661,
    268435456, 805306393, 0, 4026531840, 2852192259, 1245188, 1, 2147483651, 268435456, 805306393,
    0, 4026531840, 2852126724, 1310720, 131076, 2147483660, 2151677957, 2147483661, 2147483651,
    268435456, 1073743632, 805306393, 0, 4026531840, 3087008453, 2499805209, 0, 65539, 4026531840,
    0, 0, 603980475, 603980463, 0, 2499805209, 0, 65537, 4026531840, 0, 0, 2852126730, 2686980,
    196616, 2147489802, 2147489801, 2139101186, 2147489795, 2147483677, 2143295493, 2147489806,
    2147489807, 2147483674, 603980513, 0, 2147483674, 2147483680, 603980521, 603981106,
    603981086, 603979791, 0, 4026531840, 2852192259, 2752513, 1, 2147483677, 268435456, 805306394,
    0, 4026531840, 1073745416, 805306394, 0, 2852126727, 2818052, 131078, 2168461326, 2147489797,
    2139101186, 2151684099, 2147489807, 2147483678, 2147483675, 603980542, 0, 2147483675,
    603980555, 603979892, 0, 4026531840, 0, 2852192260, 2883585, 1, 2147483678, 268435456,
    603980552, 603979892, 0, 4026531840, 0, 1073745680, 805306395, 0, 1073745928, 805306395,
    0, 2852126732, 3014657, 65539, 2147483650, 2151694339, 2147491845, 2147483676, 603980620,
    603980578, 0, 2147483676, 603980620, 603980588, 0, 2147483676, 603980620, 603980598,
    0, 4026531840, 0, 2852192260, 720897, 1, 2147483650, 268435456, 1073744392, 805306396,
    0, 4026531840, 0, 2852192260, 851969, 1, 2147483653, 268435456, 1073744392, 805306396,
    0, 4026531840, 0, 2852192260, 917505, 1, 2147483651, 268435456, 1073744392, 805306396,
    0, 4026531840, 0, 2852126724, 786432, 65539, 2147483650, 2151677955, 2147483653, 268435456,
    1073743632, 805306396, 0, 4026531840, 0, 3087008598, 2499805212, 0, 65539, 4026531840,
    0, 0, 603980620, 603980608, 0, 2499805212, 0, 65537, 4026531840, 0, 0, 2852126772, 3080193,
    196621, 2189443104, 2189451297, 2189459490, 2147524643, 2147532836, 2160074757, 2147549222,
    2155872287, 2147541029, 2147557415, 2147565608, 2147573801, 2147581994, 2147483677,
    603980858, 603980706, 0, 2147483677, 603980858, 603980716, 0, 2147483677, 603980858,
    603980726, 0, 2147483677, 603980858, 603980736, 0, 2147483677, 603980858, 603980746,
    0, 2147483677, 603980858, 603980756, 0, 2147483677, 603980858, 603980766, 0, 2147483677,
    603980858, 603980776, 0, 2147483677, 603980858, 603980786, 0, 2147483677, 603980858,
    603980796, 0, 2147483677, 603980858, 603980806, 0, 2147483677, 603980858, 603980816,
    0, 2147483677, 603980858, 603980826, 0, 4026531840, 0, 2852192260, 3145729, 1, 2147483679,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 851969, 1, 2147483653,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3211265, 1, 2147483680,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3276801, 1, 2147483681,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3342337, 1, 2147483682,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3407873, 1, 2147483683,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3473409, 1, 2147483684,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3538945, 1, 2147483685,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3604481, 1, 2147483686,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3670017, 1, 2147483687,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3735553, 1, 2147483688,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3801089, 1, 2147483689,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852192260, 3866625, 1, 2147483690,
    268435456, 1073744904, 805306397, 0, 4026531840, 0, 2852126724, 3932164, 196621, 2189426720,
    2189426721, 2189426722, 2147483683, 2147483684, 2160066565, 2147483686, 2155872287,
    2147483685, 2147483687, 2147483688, 2147483689, 2147483690, 268435456, 1073746192,
    805306397, 0, 4026531840, 0, 3087008836, 2499805213, 0, 65539, 4026531840, 0, 0, 603980858,
    603980836, 0, 2499805213, 0, 65537, 4026531840, 0, 0, 2852126728, 3997697, 65538, 2147491884,
    2147483691, 2147483678, 603980918, 603980888, 0, 2147483678, 603980918, 603980898, 0,
    4026531840, 2852192260, 4063233, 1, 2147483691, 268435456, 1073744904, 805306398, 0,
    4026531840, 0, 2852192260, 4128769, 1, 2147483692, 268435456, 1073744904, 805306398,
    0, 4026531840, 0, 2852126724, 4194308, 65538, 2147483692, 2147483691, 268435456, 1073746192,
    805306398, 0, 4026531840, 3087008896, 2499805214, 0, 65539, 4026531840, 0, 0, 603980918,
    603980908, 0, 2499805214, 0, 65537, 4026531840, 0, 0, 2583691307, 4259841, 524292, 4026531840,
    0, 0, 0, 2147483679, 603981070, 603980994, 0, 2147483679, 603981070, 603980984, 0, 2147483679,
    603981070, 603980974, 0, 2147483679, 603981070, 603981004, 0, 2147483679, 603981070,
    603981014, 0, 2147483679, 603981070, 603981024, 0, 2147483679, 603981070, 603981034,
    0, 2147483679, 603981070, 603981044, 0, 0, 2852192260, 4325377, 1, 2147483693, 268435456,
    1073744904, 805306399, 0, 4026531840, 0, 2852192260, 4128769, 1, 2147483692, 268435456,
    1073744904, 805306399, 0, 4026531840, 0, 2852192260, 4063233, 1, 2147483691, 268435456,
    1073744904, 805306399, 0, 4026531840, 0, 2852192260, 4390913, 1, 2147483694, 268435456,
    1073744904, 805306399, 0, 4026531840, 0, 2852192260, 4456449, 1, 2147483695, 268435456,
    1073744904, 805306399, 0, 4026531840, 0, 2852192260, 4521985, 1, 2147483696, 268435456,
    1073744904, 805306399, 0, 4026531840, 0, 2852192260, 4587521, 1, 2147483697, 268435456,
    1073744904, 805306399, 0, 4026531840, 0, 2852192260, 4653057, 1, 2147483698, 268435456,
    1073744904, 805306399, 0, 4026531840, 0, 2852126724, 4718596, 196616, 2147483696, 2147483697,
    2147483698, 2147483691, 2147483692, 2147483693, 2147483694, 2147483695, 268435456,
    1073746192, 805306399, 0, 4026531840, 3087009048, 2499805215, 0, 65539, 4026531840, 0,
    0, 603981070, 603981054, 0, 2499805215, 0, 65537, 4026531840, 0, 0, 1073744904, 805306400,
    0, 2852126723, 327684, 131079, 2147483657, 2143289349, 2155872258, 2160066563, 2151677962,
    2147483662, 2147483663, 603981103, 603979791, 0, 4026531840, 1073746192, 805306400,
    0, 3087009084, 2499805216, 0, 65539, 4026531840, 0, 0, 603981106, 603981089, 0, 2499805216,
    0, 65537, 4026531840, 0, 0
]);

function isTokenActive(token_id, row) {
    var index = (row * 2) + (token_id >> 5);;
    var shift = 1 << (31 & (token_id));;
    return (token_lookup[index] & shift) != 0;
}

function pre_scan(l, token) {
    var tk_length = l.token_length;;
    var bt_length = l.byte_length;;
    var type_cache = l._type;;
    scan(l, token, 0);
    var type_out = l._type;;
    l._type = type_cache;
    l.token_length = tk_length;
    l.byte_length = bt_length;
    return type_out > 0;
}

function scan_core(l, tk_row) {
    switch ((l.get_byte_at(l.byte_offset) & 127)) {
        case 34:
            {
                if (l.get_byte_at(l.byte_offset) == 34) {
                    if (isTokenActive(14, tk_row)) {
                        l.setToken(14, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 36:
            {
                if (l.get_byte_at(l.byte_offset) == 36) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(13, tk_row)) {
                        l.setToken(13, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 39:
            {
                if (l.get_byte_at(l.byte_offset) == 39) {
                    if (isTokenActive(15, tk_row)) {
                        l.setToken(15, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 45:
            {
                if (l.get_byte_at(l.byte_offset) == 45) {
                    if (l.get_byte_at(l.byte_offset + 1) == 45) {
                        if (isTokenActive(10, tk_row)) {
                            l.setToken(10, 2, 2);
                            return;
                        }
                    } else if (isTokenActive(9, tk_row)) {
                        l.setToken(9, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 46:
            {
                if (l.get_byte_at(l.byte_offset) == 46) {
                    if (isTokenActive(20, tk_row)) {
                        l.setToken(20, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 48:
            {
                if (l.get_byte_at(l.byte_offset) == 48) {
                    if (l.get_byte_at(l.byte_offset + 1) == 120) {
                        if (isTokenActive(21, tk_row) && token_production(l, 67109446, 19, 21, 4, states_buffer, scan) && l.byte_length > 2) {
                            return;
                        } else if (isTokenActive(22, tk_row)) {
                            l.setToken(22, 2, 2);
                            return;
                        }
                    } else if (l.get_byte_at(l.byte_offset + 1) == 98) {
                        if (isTokenActive(23, tk_row) && token_production(l, 67109459, 21, 23, 8, states_buffer, scan) && l.byte_length > 2) {
                            return;
                        } else if (isTokenActive(24, tk_row)) {
                            l.setToken(24, 2, 2);
                            return;
                        }
                    } else if (l.get_byte_at(l.byte_offset + 1) == 79) {
                        if (isTokenActive(25, tk_row) && token_production(l, 67109472, 23, 25, 16, states_buffer, scan) && l.byte_length > 2) {
                            return;
                        } else if (isTokenActive(26, tk_row)) {
                            l.setToken(26, 2, 2);
                            return;
                        }
                    } else if (l.get_byte_at(l.byte_offset + 1) == 111) {
                        if (isTokenActive(25, tk_row) && token_production(l, 67109472, 23, 25, 16, states_buffer, scan) && l.byte_length > 2) {
                            return;
                        } else if (isTokenActive(27, tk_row)) {
                            l.setToken(27, 2, 2);
                            return;
                        }
                    } else if (isTokenActive(17, tk_row) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(21, tk_row) && token_production(l, 67109446, 19, 21, 4, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(23, tk_row) && token_production(l, 67109459, 21, 23, 8, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(25, tk_row) && token_production(l, 67109472, 23, 25, 16, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(5, tk_row) && l.isNum() && l.byte_length > 1) {
                        l._type = 5;
                        return;
                    } else if (isTokenActive(44, tk_row)) {
                        l.setToken(44, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 49:
            {
                if (l.get_byte_at(l.byte_offset) == 49) {
                    if (isTokenActive(17, tk_row) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(5, tk_row) && l.isNum() && l.byte_length > 1) {
                        l._type = 5;
                        return;
                    } else if (isTokenActive(43, tk_row)) {
                        l.setToken(43, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 50:
            {
                if (l.get_byte_at(l.byte_offset) == 50) {
                    if (isTokenActive(17, tk_row) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(5, tk_row) && l.isNum() && l.byte_length > 1) {
                        l._type = 5;
                        return;
                    } else if (isTokenActive(46, tk_row)) {
                        l.setToken(46, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 51:
            {
                if (l.get_byte_at(l.byte_offset) == 51) {
                    if (isTokenActive(17, tk_row) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(5, tk_row) && l.isNum() && l.byte_length > 1) {
                        l._type = 5;
                        return;
                    } else if (isTokenActive(47, tk_row)) {
                        l.setToken(47, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 52:
            {
                if (l.get_byte_at(l.byte_offset) == 52) {
                    if (isTokenActive(17, tk_row) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(5, tk_row) && l.isNum() && l.byte_length > 1) {
                        l._type = 5;
                        return;
                    } else if (isTokenActive(48, tk_row)) {
                        l.setToken(48, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 53:
            {
                if (l.get_byte_at(l.byte_offset) == 53) {
                    if (isTokenActive(17, tk_row) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(5, tk_row) && l.isNum() && l.byte_length > 1) {
                        l._type = 5;
                        return;
                    } else if (isTokenActive(49, tk_row)) {
                        l.setToken(49, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 54:
            {
                if (l.get_byte_at(l.byte_offset) == 54) {
                    if (isTokenActive(17, tk_row) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(5, tk_row) && l.isNum() && l.byte_length > 1) {
                        l._type = 5;
                        return;
                    } else if (isTokenActive(50, tk_row)) {
                        l.setToken(50, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 55:
            {
                if (l.get_byte_at(l.byte_offset) == 55) {
                    if (isTokenActive(17, tk_row) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(5, tk_row) && l.isNum() && l.byte_length > 1) {
                        l._type = 5;
                        return;
                    } else if (isTokenActive(45, tk_row)) {
                        l.setToken(45, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 61:
            {
                if (l.get_byte_at(l.byte_offset) == 61) {
                    if (isTokenActive(30, tk_row)) {
                        l.setToken(30, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 65:
            {
                if (l.get_byte_at(l.byte_offset) == 65) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(38, tk_row)) {
                        l.setToken(38, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 66:
            {
                if (l.get_byte_at(l.byte_offset) == 66) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(39, tk_row)) {
                        l.setToken(39, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 67:
            {
                if (l.get_byte_at(l.byte_offset) == 67) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(40, tk_row)) {
                        l.setToken(40, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 68:
            {
                if (l.get_byte_at(l.byte_offset) == 68) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(41, tk_row)) {
                        l.setToken(41, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 69:
            {
                if (l.get_byte_at(l.byte_offset) == 69) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(18, tk_row)) {
                        l.setToken(18, 1, 1);
                        return;
                    } else if (isTokenActive(42, tk_row)) {
                        l.setToken(42, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 70:
            {
                if (l.get_byte_at(l.byte_offset) == 70) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(31, tk_row)) {
                        l.setToken(31, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 92:
            {
                if (l.get_byte_at(l.byte_offset) == 92) {
                    if (isTokenActive(16, tk_row)) {
                        l.setToken(16, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 95:
            {
                if (l.get_byte_at(l.byte_offset) == 95) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(12, tk_row)) {
                        l.setToken(12, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 97:
            {
                if (l.get_byte_at(l.byte_offset) == 97) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(32, tk_row)) {
                        l.setToken(32, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 98:
            {
                if (l.get_byte_at(l.byte_offset) == 98) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(33, tk_row)) {
                        l.setToken(33, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 99:
            {
                if (l.get_byte_at(l.byte_offset) == 99) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(34, tk_row)) {
                        l.setToken(34, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 100:
            {
                if (l.get_byte_at(l.byte_offset) == 100) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(35, tk_row)) {
                        l.setToken(35, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 101:
            {
                if (l.get_byte_at(l.byte_offset) == 101) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(19, tk_row)) {
                        l.setToken(19, 1, 1);
                        return;
                    } else if (isTokenActive(36, tk_row)) {
                        l.setToken(36, 1, 1);
                        return;
                    }
                }
            }
            break;
        case 102:
            {
                if (l.get_byte_at(l.byte_offset) == 102) {
                    if (isTokenActive(11, tk_row) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(28, tk_row) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan) && l.byte_length > 1) {
                        return;
                    } else if (isTokenActive(3, tk_row) && l.isUniID() && l.byte_length > 1) {
                        l._type = 3;
                        return;
                    } else if (isTokenActive(37, tk_row)) {
                        l.setToken(37, 1, 1);
                        return;
                    }
                }
            }
            break;
        default:
            break;
    };
    if (isTokenActive(11, tk_row) && pre_scan(l, 73) && token_production(l, 67109072, 9, 11, 1, states_buffer, scan)) {
        return;
    } else if (isTokenActive(17, tk_row) && pre_scan(l, 74) && token_production(l, 67109372, 16, 17, 2, states_buffer, scan)) {
        return;
    } else if (isTokenActive(21, tk_row) && pre_scan(l, 75) && token_production(l, 67109446, 19, 21, 4, states_buffer, scan)) {
        return;
    } else if (isTokenActive(23, tk_row) && pre_scan(l, 76) && token_production(l, 67109459, 21, 23, 8, states_buffer, scan)) {
        return;
    } else if (isTokenActive(25, tk_row) && pre_scan(l, 77) && token_production(l, 67109472, 23, 25, 16, states_buffer, scan)) {
        return;
    } else if (isTokenActive(28, tk_row) && pre_scan(l, 73) && token_production(l, 67109507, 25, 28, 32, states_buffer, scan)) {
        return;
    } else if (isTokenActive(0, tk_row) && false) {
        l._type = 0;
        return;
    } else if (isTokenActive(8, tk_row) && l.isSP(true)) {
        l._type = 8;
        return;
    } else if (isTokenActive(3, tk_row) && l.isUniID()) {
        l._type = 3;
        return;
    } else if (isTokenActive(2, tk_row) && l.isSym(true)) {
        l._type = 2;
        return;
    } else if (isTokenActive(7, tk_row) && l.isNL()) {
        l._type = 7;
        return;
    } else if (isTokenActive(5, tk_row) && l.isNum()) {
        l._type = 5;
        return;
    }
}

function scan(l, token, skip) {
    if (((l._type) <= 0)) scan_core(l, token);;
    if ((skip > 0 && isTokenActive(l._type, skip))) {
        while ((isTokenActive(l._type, skip))) {
            l.next();
            scan_core(l, token);
        }
    }
}

const js_parser_pack = {

    init_table: () => {
        const table = new Uint8Array(382976);
        init_table(table);
        return table;
    },

    create_iterator: (data) => {
        return new KernelStateIterator(data);
    },

    recognize: (string, entry_index) => {

        const temp_buffer = new Uint8Array(string.length * 4);

        const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

        const input_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

        let entry_pointer = 0;

        switch (entry_index) {

            case 0: default: entry_pointer = 67108868; break;
        }

        return run(
            states_buffer,
            input_buffer,
            input_buffer.length,
            entry_pointer,
            scan,
            false
        );
    }
};

const reduce_functions = [(_, s) => s[s.length - 1], (env, sym, pos) => ((Object.assign(Object.fromEntries(sym[0].map(([key, val, hyphens], i) => [key, { index: i, val: val, hyphens: hyphens }])), { __array__: sym[0] }))) /*0*/,
(env, sym, pos) => (sym[1].split("").flatMap((v, i, r) => { if (i == r.length - 1 && sym[2]) if (!!(typeof env.data[v] == "string" ? env.data[env.data[v]] : env.data[v]) || (sym[2].e)) { return { key: v, val: sym[2].v, hyphens: 1 }; } else return [{ key: v, val: true, hyphens: 1 }, { key: sym[2].v, val: null, hyphens: 0 }]; return { key: v, val: true, hyphens: 1 }; })) /*1*/,
(env, sym, pos) => (sym[1].split("").flatMap((v, i, r) => { if (i == r.length - 1 && null) if (!!(typeof env.data[v] == "string" ? env.data[env.data[v]] : env.data[v]) || (null.e)) { return { key: v, val: null.v, hyphens: 1 }; } else return [{ key: v, val: true, hyphens: 1 }, { key: null.v, val: null, hyphens: 0 }]; return { key: v, val: true, hyphens: 1 }; })) /*2*/,
(env, sym, pos) => ((sym[2]) ? (!!(typeof env.data[sym[1]] == "string" ? env.data[env.data[sym[1]]] : env.data[sym[1]]) || sym[2].e) ? { key: sym[1], val: sym[2].v, hyphens: 2 } : [{ key: sym[1], val: true, hyphens: 2 }, { key: sym[2].v, val: null, hyphens: 0 }] : { key: sym[1], hyphens: 2 }) /*3*/,
(env, sym, pos) => ((null) ? (!!(typeof env.data[sym[1]] == "string" ? env.data[env.data[sym[1]]] : env.data[sym[1]]) || null.e) ? { key: sym[1], hyphens: 2 } : [{ key: sym[1], val: true, hyphens: 2 }, { key: null.v, val: null, hyphens: 0 }] : { key: sym[1], hyphens: 2 }) /*4*/,
(env, sym, pos) => ({ key: sym[0], val: null, hyphens: 0 }) /*5*/,
(env, sym, pos) => (sym[0] + sym[1]) /*6*/,
(env, sym, pos) => (sym[0]) /*7*/,
(env, sym, pos) => (sym[1]) /*8*/,
(env, sym, pos) => (sym[0] + "") /*9*/,
(env, sym, pos) => (sym[0] + sym[2]) /*10*/,
(env, sym, pos) => ([sym[0]]) /*11*/,
(env, sym, pos) => ((sym[0].push(sym[2]), sym[0])) /*12*/,
(env, sym, pos) => (sym[0].flat().map(({ key, val, hyphens }) => [key, val, hyphens])) /*13*/,
(env, sym, pos) => ({ e: !!sym[0], v: sym[1] }) /*14*/,
(env, sym, pos) => ({ e: !!null, v: sym[0] }) /*15*/,
(env, sym, pos) => ((sym[0].push(sym[1]), sym[0])) /*16*/];

export default ParserFramework(
    reduce_functions,
    {
        start: 0,
    },
    js_parser_pack,

);