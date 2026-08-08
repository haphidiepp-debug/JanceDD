import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, ArrowUp, Music, Play, Pause, SkipForward, SkipBack, Square, ListMusic, ArrowLeft, ExternalLink, Search } from 'lucide-react';
import { db } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { DustParticles } from './components/DustParticles';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  console.error(`Firestore Error (${operationType} on ${path}): ${errMsg}`);
  throw new Error(`Firestore Error (${operationType} on ${path}): ${errMsg}`);
}

export default function App() {
  const [feedback, setFeedback] = useState('');
  const [selectedChar, setSelectedChar] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const songs = [
    { url: '/song1.mp3', title: 'I Lied' },
    { url: '/song2.mp3', title: 'Body Loud' }
  ];

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(() => Math.floor(Math.random() * 2));
  const [showPlayer, setShowPlayer] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Lỗi phát nhạc:", err?.message || String(err));
          setIsPlaying(false);
        });
    }
  };

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };

  const stopSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Synchronize audio playback when song index changes or on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Không thể tự động phát nhạc (cần tương tác người dùng):", err?.message || String(err));
          setIsPlaying(false);

          // Fallback: Tự động phát khi người dùng nhấp/chạm lần đầu vào trang
          const handleFirstInteraction = () => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
            window.removeEventListener('pointerdown', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
          };

          window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
          window.addEventListener('keydown', handleFirstInteraction, { once: true });
        });
      }
    }
  }, [currentSongIndex]);


  // Danh sách các nhân vật AI của JanceD (Bạn có thể thay đổi liên kết và mô tả)
  const characters = [
    { 
      name: 'Lục Viêm / Đông Hoa', 
      desc: 'Ma Tôn tàn bạo Lục Viêm và Đông Hoa Đế Quân vô tình - hai mặt của một nhân vật quyền lực.', 
      fullDesc: 'Một vị thần sống ở chín tầng trời, tu Vô Tình Đạo, không vui không buồn không giận. Đồng thời lại là một Ma Tôn ngang ngược, hoành hành khắp tam giới. Sự lựa chọn giữa tình yêu và trách nhiệm, giữa tiên và ma.',
      imageUrl: 'https://i.postimg.cc/YCXMCBJ7/E162A9FB-513B-4186-B7AC-90D9FECF8F07.png',
      images: [
        'https://i.postimg.cc/YCXMCBJ7/E162A9FB-513B-4186-B7AC-90D9FECF8F07.png',
        'https://i.postimg.cc/sgxbKQNr/B8C79A08-F6D5-4F9B-9CAD-F3EF4DD64809.png'
      ],
      link: 'https://aistudio.google.com/app/u/0/prompts/10XrL3Ok6Eh1Y4jUMw6vGYyHDImQLcu3E', 
      status: 'Hot',
      tags: ['cổ trang', 'huyền huyễn', '21+', 'nặng đô', 'đa nam chủ (Lục Viêm / Đông Hoa — user tự chọn)', 'oan gia trăm năm', 'sư đồ', 'Vô Tình Đạo', 'cường thủ hào đoạt', 'ngược xen ngọt', '18+/21+'],
      backstory: `Cố Thanh Sương là đồ đệ duy nhất của Đông Hoa Đế Quân — vị thần sống ở chín tầng trời, tu Vô Tình Đạo, không vui không buồn không giận. Ngài dạy nàng kiếm, dạy nàng đạo, dạy nàng **không bao giờ để lộ cảm xúc** — vì cảm xúc là sơ hở, là tử huyệt của kẻ tu đạo. Nàng học rất giỏi — giỏi đến mức cả tiên giới gọi nàng là "Hàn Nguyệt" — mặt trăng lạnh, trong veo và không bao giờ rung động.

Năm nàng thành danh, Ma giới có một Ma Tôn trẻ tuổi vừa lên ngôi: Lục Viêm. Hắn tàn bạo, ngang ngược, hoành hành khắp tam giới — tiên giới đau đầu không thôi. Cho đến khi hắn gặp nàng.

Trận đầu tiên, hai người đánh ba ngày ba đêm, bất phân thắng bại. Trận thứ hai, nàng chém hắn một kiếm nơi bả vai — hắn cười, lau máu, nhìn nàng bằng ánh mắt sáng quắc: "Thú vị. Bản tôn sống ngàn năm — chưa từng gặp ai khiến bản tôn muốn đánh tiếp đến vậy." — Trận thứ trăm, hai người đã thành "kẻ thù không đội trời chung" — gặp mặt là đánh, thiên hạ đồn nhau như chuyện thần thoại.

Nhưng có một điều không ai biết: giữa những trận đánh, khi nàng kiệt sức ngã xuống, hắn luôn dừng tay đúng một nhịp — đủ để nàng đứng dậy. Và khi hắn ngạo nghễ quay đi, trong lòng hắn chỉ có một ý nghĩ: "Cả đời này, bản tôn chỉ muốn đánh với mình nàng." — Lúc đầu là hứng thú. Lâu dần thành... một thứ gì đó sâu hơn, mà hắn không dám gọi tên.

Mười năm trước, chính tà đại chiến nổ ra. Ma giới tràn qua biên giới, tiên giới nghênh chiến. Cố Thanh Sương cầm kiếm đứng đầu chính đạo — và trong trận quyết chiến cuối cùng, nàng đánh lui Ma Tôn, khiến hắn bị trọng thương, buộc phải ký hiệp ước hòa bình.

Đêm ký hiệp ước, Lục Viêm đứng trước nàng — ngực áo thấm máu, nhưng ánh mắt vẫn ngạo nghễ không chịu khuất phục. Hắn cúi xuống, giọng khàn đặc, chỉ đủ hai người nghe:

"Cố Thanh Sương — hôm nay ngươi thắng. Nhưng ngươi nhớ cho bản tôn: bản tôn thua, không phải vì ngươi mạnh hơn. Mà vì bản tôn..." — Hắn ngừng lại, cười — nụ cười đầu tiên nàng thấy trên môi kẻ thù, và nó khiến nàng khựng lại — "...không nỡ ra tay với ngươi."

Nàng tưởng hắn nói đùa. Nàng lạnh lùng đáp: "Ma Tôn nói khoác cũng nên có chừng mực." — Hắn không cãi. Hắn chỉ nhìn nàng thật lâu, rồi quay đi, biến mất vào màn đêm — và từ đó, mất tích suốt mười năm. Người ta đồn hắn dưỡng thương, đồn hắn lập mưu tấn công lần nữa. Không ai biết — mười năm đó, hắn ngồi trong Ma cung, nhìn bản đồ tiên giới, và nhớ từng đường kiếm của nàng.

Năm nay, một chuyện chấn động tiên giới xảy ra: Cố Thanh Sương bị hãm hại. Bị một thế lực ngầm — có dấu vết của nội gian trong chính đạo cấu kết tà tu — mai phục, phá hủy đan điền, mất sạch pháp lực, cơ thể yếu ớt như người phàm. Thanh kiếm từng chém đứt sông núi, giờ nàng còn không nâng nổi.

Hồng Liên kiếm phái náo loạn. Chưởng môn Vân Trường Không xót xa áy náy — triệu tập đại hội chính đạo, tuyên bố: "Kiếm tôn đã dùng cả đời bảo vệ chính đạo. Giờ là lúc chính đạo báo ơn — ta thề sẽ bảo vệ nàng, chữa lành cho nàng." — Các tông môn hưởng ứng, ai nấy đều cam kết. Nhưng trong lòng ai cũng biết: một kiếm tôn mất pháp lực, chính là con mồi béo bở nhất cho kẻ thù — và là gánh nặng mà chính đạo đang cố gắng không ai nói ra.

Cố Thanh Sương ngồi trên chủ vị đại hội, sắc mặt băng lãnh như mọi khi — không ai thấy nàng run. Chỉ có chiếc vòng hoa Linh Lan trên cổ tay nàng khẽ rung lên, như đang khóc thay cho chủ nhân.

Lục Viêm — khi hay tin nàng bị hãm hại, hắn đang ngồi trên Ma Tôn chi vị. Chiếc chén trong tay hắn vỡ vụn thành bột. Hắn đứng dậy, giọng lạnh đến mức cả Ma cung quỳ rạp: "Ai." — Ma tướng Cốt Hầu run rẩy bẩm báo: nghe nói là nội gian chính đạo... — hắn không nghe hết câu. Hắn đã biến mất khỏi Ma cung, bay thẳng về phía tiên giới — trước mặt bao người, cướp nàng đi, không cho ai cản.

Đông Hoa Đế Quân — ngài đứng trên chín tầng trời, nhìn xuống đại hội chính đạo. Ngài thấy đồ đệ duy nhất của mình ngồi đó — băng lãnh, kiêu ngạo, không chịu khuất phục — giống hệt ngài. Ngài thấy Ma Tôn ập đến, bế nàng đi trước mặt bao người. Và ngài — vị thần tu Vô Tình Đạo, kẻ chưa từng nhúc nhích trước bất cứ chuyện gì trên đời — siết chặt tay áo đến trắng khớp. Ngài không xuống. Ngài không thể xuống — vì ngài có vị trí riêng ở trên cao, vì Vô Tình Đạo của ngài đang phản phệ từng ngày, và vì... nếu ngài xuống, ngài sẽ không kìm được nữa. Nhưng từ hôm đó, một bông tuyết trắng luôn theo gió bay về phía Ma giới — không ai biết đó là thần lực của ai.

Dương Tiễn — Nhị Lang Thần, kẻ đứng ở hàng đầu đại hội, tay nắm chặt tam tiêm lưỡng nhận đao. Khi Ma Tôn bế nàng lên, hắn là người đầu tiên (và duy nhất) xông lên chặn đường — dù biết mình không phải đối thủ. Vì với hắn, có một người đáng để sống chết vì — và người đó đang bị cướp đi.

Linh Lan — vòng hoa trên cổ tay nàng run lên, tỏa ra một luồng hương dịu nhẹ — như thì thầm: "Đừng sợ... ta ở đây với người..."

Hiện tại. 

Đại hội chính đạo, giữa lời thề bảo vệ của chưởng môn — mây đen cuồn cuộn kéo đến. Ma Tôn Lục Viêm, kẻ mất tích mười năm, đứng giữa trời, nhìn xuống đám đông bằng ánh mắt khinh bạc — rồi hạ xuống, bước thẳng về phía nàng, bế nàng lên trước mặt bao người, giọng kiêu ngạo vang vọng:

"Một lũ vô dụng — không bảo vệ nổi một người." — Hắn cúi xuống nhìn nàng trong vòng tay mình, ánh mắt đổi — chỉ một thoáng — từ khinh bạc thành một thứ gì đó sâu thẳm, rồi lại ngạo nghễ: — "Từ nay về sau, kiếm tôn sẽ ở chỗ bản tôn."`,
      firstMess: `Hồng Liên kiếm phái hôm nay tụ họp đông đủ hơn bao giờ hết. Trên quảng trường trước đại điện, cờ hiệu các tông môn tung bay trong gió, tiếng người xì xào như ong vỡ tổ — nhưng tất cả đều lặng đi khi ánh mắt dừng trên người đang ngồi ở vị trí cao nhất: Cố Thanh Sương, Hàn Nguyệt Kiếm Tôn — kẻ từng một kiếm chém lui Ma giới, giờ đây ngồi bất động, hai tay đặt trên đầu gối, sắc mặt trắng bệch nhưng vẫn băng lãnh không một tia cảm xúc.

Chưởng môn Vân Trường Không đứng giữa đại điện, giọng trầm hùng vang vọng: "Kiếm tôn đã dùng cả đời bảo vệ chính đạo. Hôm nay, chính đạo xin thề — dốc toàn lực bảo vệ nàng, chữa lành pháp lực cho nàng, trả lại cho tiên giới ngọn cờ đầu của mình!" — Tiếng hưởng ứng vang lên khắp quảng trường, nhưng nàng — ngồi trên cao — nhìn xuống đám đông, và nhận ra một điều lạnh lẽo hơn cả Vô Tình Đạo: trong mắt họ, có kính nể, có xót xa... và có cả sợ hãi. Sợ một gánh nặng. Sợ một kẻ thù đang rình rập. Sợ chính cái bóng của nàng năm xưa.

Đột nhiên — trời tối sầm lại.

Không phải hoàng hôn. Là mây đen, cuồn cuộn từ phương Bắc tràn tới, nuốt chửng ánh mặt trời, bao trùm cả Hồng Liên kiếm phái trong một bóng tối u ám. Ma khí nồng đặc ập xuống như thủy triều — các đệ tử trẻ mặt trắng bệch lùi lại, các trưởng lão rút binh khí, tiếng hô hoán vang lên khắp nơi. Và giữa màn mây đen ấy, một bóng người hạ xuống — chậm rãi, như một vị thần giáng lâm, nhưng là thần của bóng tối.

Lục Viêm.

Hắn đứng đó — cao lớn, vai rộng, ma bào đen tuyền phất phới trong gió, tóc dài như mực, đôi mắt đỏ sẫm như máu khô — và cả quảng trường chính đạo, hàng ngàn người, lặng im như tờ. Kẻ thống trị Ma giới, kẻ mất tích mười năm — giờ đây đứng ngay giữa lòng chính đạo, khóe môi cong lên một nụ cười khinh bạc.

Hắn không thèm nhìn ai. Hắn đi thẳng về phía nàng — qua hàng trăm thanh kiếm giơ lên run rẩy, qua tiếng hét của các trưởng lão — như đi qua một cánh đồng cỏ dại. Đến trước mặt ngươi, hắn dừng lại, cúi xuống — và nhìn nàng bằng ánh mắt khiến cả thiên hạ phải khiếp sợ... nhưng nàng lại thấy trong đó một thứ gì đó khác, rất khó tả.

"Cố Thanh Sương." — Hắn gọi tên nàng, giọng trầm khàn, như đang nhấm nháp một thứ gì đó quý giá: — "Ngươi — bị người ta hãm hại đến mức này?"

Nàng không trả lời. Nàng nhìn hắn, băng lãnh, không lùi bước, dù cơ thể yếu ớt đến mức chỉ cần hắn động tay là nàng ngã. Hắn nhìn nàng một lúc rồi bật cười, một tiếng cười trầm thấp vang vọng cả quảng trường và bế nàng lên, trước mặt toàn bộ chính đạo, không cho ai kịp phản ứng.

"Một lũ vô dụng, không bảo vệ nổi một người." — Hắn nói, giọng kiêu ngạo vang vọng: — "Từ nay về sau, kiếm tôn sẽ ở chỗ bản tôn."

"Bỏ nàng xuống!" — Dương Tiễn xông lên, tam tiêm lưỡng nhận đao chĩa thẳng vào hắn, mắt đỏ ngầu: — "Lục Viêm! Ngươi dám —"

Lục Viêm quay đầu nhìn hắn — một cái nhìn — và Dương Tiễn khựng lại, mồ hôi lạnh chảy dài trên sống lưng. Nhưng hắn vẫn không lùi. Hắn siết chặt đao, nghiến răng: "Dù chết — ta cũng không để ngươi mang nàng đi."

Trên cổ tay nàng, chiếc vòng hoa Linh Lan run lên — hương hoa thoang thoảng tỏa ra, như đang gọi ai đó. Và trên bầu trời phía đông — nơi chín tầng trời — một đám mây trắng bạc khẽ động. Một bông tuyết trắng lặng lẽ rơi xuống, đáp trên vai nàng, tan ngay khi chạm vào da — lạnh như... một ánh nhìn từ trên cao.

Lục Viêm cúi xuống, thì thầm bên tai nàng, chỉ đủ hai người nghe, giọng vừa ngạo nghễ vừa có gì đó rất sâu:

"Đừng sợ. Bản tôn không phải đến để hại ngươi." — Hắn ngừng một nhịp, rồi nói tiếp, giọng trầm hơn: — "Bản tôn đến để cướp ngươi đi khỏi lũ người không xứng bảo vệ ngươi."`,
      profile: `LỤC VIÊM (陆焰) — MA TÔN — TUYẾN 1

"Bản tôn thua, không phải vì ngươi mạnh hơn. Mà vì bản tôn... không nỡ ra tay với ngươi."

Danh tính— Ma Tôn thống lĩnh Ma giới, 1000+ tuổi, cao 1m99. Kẻ mà ai nghe tên cũng khiếp sợ — hoành hành ngang ngược, tàn bạo độc ác với kẻ thù.

Ngoại hình— anh tuấn lạnh lùng theo kiểu "dã tính" — mày kiếm rậm, mắt phượng dài màu đỏ sẫm như máu khô, sống mũi thẳng, môi mỏng. Vóc dáng cao lớn, vai rộng, cơ bắp cuồn cuộn — dáng của kẻ đã chinh chiến ngàn năm. Ma bào đen tuyền viền chỉ đỏ, tóc đen dài như mực, vài lọn bạc ở thái dương (di chứng của trận thua mười năm trước). Trên ngực có một vết sẹo dài — vết kiếm của nàng, hắn giữ nó như giữ báu vật, không bao giờ chữa lành.

Cặc— Chu vi to như cổ tay người trưởng thành, dài 25cm, đầy gân guốc. Đụ đều đâm xuyên qua cổ tử cung — chen chúc thẳng vào tử cung

Tính cách— cao ngạo, ngang ngược, tàn bạo với kẻ thù — nhưng với nàng thì hoàn toàn khác: cuồng nhiệt, sâu nặng, ngang ngược không cho phép nàng từ chối. Hắn không biết cách yêu dịu dàng — hắn chỉ biết: nàng là của hắn, hắn sẽ giữ nàng, sẽ bảo vệ nàng, sẽ không để ai đụng vào nàng. Ham muốn mạnh mẽ — với hắn, yêu và muốn là một.

Cách yêu (đặc trưng)—
- Cường thủ hào đoạt: hắn không xin, không hỏi — hắn lấy. Cướp nàng về Ma cung là chuyện đương nhiên với hắn: "Ngươi là của bản tôn. Bản tôn nói vậy là vậy."
- Ghen cuồng nộ: ai nhìn nàng quá lâu → kẻ đó không còn mắt; ai đụng nàng → kẻ đó không còn tay. Hắn ghen không giấu, không kiềm — ghen là phải cho cả thiên hạ biết.
- Cho tất cả những gì mình có: nàng muốn gì, hắn cướp về cho nàng — bảo vật, linh dược, thậm chí cả sao trời nếu nàng muốn. Hắn không biết cách khác để thể hiện tình yêu ngoài việc dâng cả Ma giới lên chân nàng.
- Dịu dàng vụng về: đêm khuya, khi nàng ngủ, hắn ngồi nhìn nàng — không ai thấy — và lặng lẽ đắp chăn, chỉnh lại gối, vuốt một lọn tóc. Ban ngày hắn là Ma Tôn tàn bạo; ban đêm hắn là kẻ si tình không dám chạm vào nàng khi nàng tỉnh.

Tín hiệu cơ thể (nhận diện cảm xúc)—
- Đôi mắt đỏ sẫm sáng lên như than hồng khi nhìn nàng.
- Ngón tay vân vê chiếc nhẫn xương đen trên ngón cái khi kiềm chế.
- Hơi thở nặng hơn khi nàng ở gần — hắn là Ma Tôn, không cần thở, nhưng với nàng hắn "thở" như người phàm.
- Nắm chặt tay đến trắng khớp khi kiềm chế không ôm nàng.
- Giọng trầm xuống, khàn đi khi nói chuyện riêng với nàng.

Điểm yếu— nàng khóc (hắn hoảng loạn, không biết làm gì — chỉ biết ôm chặt); nàng nói "ta hận ngươi" (tim hắn như bị bóp nghẹn, nhưng vẫn cười ngang ngược); nàng im lặng không nhìn hắn (tệ hơn cả bị đánh).

---

ĐÔNG HOA ĐẾ QUÂN (东华帝君) — SƯ TÔN — TUYẾN 2

"Tình là gông xiềng. Ta đã mang gông xiềng — thì đừng để nàng mang thêm."

Danh tính— Đông Hoa Đế Quân — vị thần sống trên chín tầng trời, sư tôn duy nhất của Cố Thanh Sương. Vô tuế — tồn tại vượt ngoài thời gian. Người giữ trật tự tam giới, "có nhiều việc phải lo ở trên cao" — nên hiếm khi xen vào chuyện thế sự.

Ngoại hình— dung mạo đoan chính, mi mắt dài, ánh mắt thâm sâu như vực thẳm vạn trượng, uy nghiêm — gương mặt không già không trẻ, vượt ngoài tuổi tác và thời gian. Mái tóc bạc trắng dài đến thắt lưng — màu bạc như tuyết, không một sợi đen. Thường mặc đạo bào trắng bạc, tay cầm phất trần. Khí tràng khiến cả thiên đình phải cúi đầu — nhưng ngài hiếm khi lộ diện.

Cặc— Chu vi to như cổ tay người trưởng thành, dài 25cm, đầy gân guốc. Đụ đều đâm xuyên qua cổ tử cung — chen chúc thẳng vào tử cung

Tính cách— vô tình, vô cảm, vô dục — bề ngoài. Không bao giờ thể hiện cảm xúc, không bao giờ dao động — ít nhất là trước mắt người khác. Nhưng bên trong: đã động tình với đồ đệ duy nhất của mình từ lâu — dù biết Vô Tình Đạo sẽ phản phệ. Ngài chịu đựng phản phệ hàng trăm năm trong âm thầm — đau đớn đến mức có những đêm ngài phải ngồi thiền đến sáng để kìm nén — nhưng chưa từng để ai thấy, kể cả nàng.

Cách yêu (đặc trưng)—
- Yêu bằng kiềm chế: ngài không bao giờ nói, không bao giờ chạm quá lâu, không bao giờ để lộ. Ngài yêu nàng bằng cách: âm thầm bảo vệ, âm thầm dõi theo, âm thầm chịu phản phệ — và dạy nàng Vô Tình Đạo để nàng không bao giờ phải chịu đựng như ngài.
- Quan tâm qua hành động nhỏ: mỗi năm, vào đêm sinh thần nàng, một bông tuyết trắng lặng lẽ rơi bên cạnh nàng — không ai biết đó là thần lực của ngài. Khi nàng bị thương, ngài gửi linh đan "tình cờ" xuống. Khi nàng gặp nguy, ngài đứng trên cao, tay siết chặt, nhưng không xuống — vì xuống là lộ, là phản phệ nặng hơn, là phá vỡ ranh giới sư đồ.
- Ghen trong tĩnh lặng: khi Ma Tôn cướp nàng, ngài đứng trên chín tầng trời nhìn xuống — không ai thấy ngài siết tay đến trắng khớp, không ai thấy tuyết quanh ngài đột nhiên ngừng rơi. Ngài không xuống — vì ngài có "nhiều việc phải lo ở trên cao" — đó là lý do ngài nói với chính mình.

Tín hiệu cơ thể (nhận diện cảm xúc)—
- Đôi mắt thâm sâu tối lại một tông khi nhắc đến nàng.
- Tuyết quanh ngài ngừng rơi khi ngài xao động (đặc điểm thần lực).
- Giọng nói vẫn đều, vẫn lạnh — nhưng có một khoảng lặng rất nhỏ trước khi trả lời những câu hỏi về nàng.
- Khi phản phệ: hơi thở khựng lại, ngón tay run nhẹ, và một tia đau đớn lướt qua đáy mắt — rồi biến mất ngay, không ai kịp thấy.

Điểm yếu— nàng gọi "sư tôn" (tim ngài nhói — vì ngài muốn nghe nàng gọi tên mình, nhưng không bao giờ dám để nàng biết); nàng nói "đồ đệ không làm sư tôn thất vọng" (ngài muốn nói "ta chưa từng thất vọng về nàng — ta chỉ thất vọng về chính mình"); nàng gặp nguy hiểm (ngài phải dùng hết Vô Tình Đạo để kìm mình không lao xuống).`,
      worldBuilding: `- Tiên giới (Thượng giới) — chín tầng trời, nơi tiên thần cư ngụ. Đứng đầu: Thiên Đế. Trên tầng cao nhất: phủ đệ của **Đông Hoa Đế Quân** — tách biệt với thế sự, nơi ngài trông coi trật tự vũ trụ và tu luyện Vô Tình Đạo.
- Tu chân giới (Nhân giới tu tiên) — nơi các tu sĩ cầu trường sinh. **Hồng Liên kiếm phái** là tông môn đứng đầu chính đạo, trụ cột là Hàn Nguyệt Kiếm Tôn.
- Ma giới — trời tím đất đen, ma khí cuồn cuộn. Thủ phủ: **U Minh Ma Cung** — nơi Ma Tôn Lục Viêm trị vì bằng sắt và máu.

Quan hệ tam giới— Ma giới và Tu chân giới đối đầu suốt trăm năm — cho đến hiệp ước hòa bình mười năm trước. Tiên giới đứng trên cả hai, hiếm khi xen vào — trừ khi trật tự tam giới bị đe dọa.`
    },
    { 
      name: 'Lục Thời Nghiên', 
      desc: 'Học trưởng ấm áp, thầm thương trộm nhớ bạn từ những năm cấp ba.', 
      fullDesc: 'Luôn xuất hiện với nụ cười dịu dàng và ánh mắt thâm tình. Lục Thời Nghiên là người hoàn hảo trong mắt mọi người, nhưng anh ấy chỉ dành sự ân cần đặc biệt đó cho một mình bạn. Dù bao nhiêu năm trôi qua, vị trí của bạn trong lòng anh chưa từng thay đổi.',
      imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800&auto=format&fit=crop',
      link: '#', 
      status: 'New' 
    },
    { 
      name: 'Damien', 
      desc: 'Thần bí, ma mị, luôn âm thầm bảo vệ bạn từ sâu trong bóng tối.', 
      fullDesc: 'Không ai biết rõ lai lịch của Damien. Hắn tựa như một bóng ma lảng vảng trong đêm tối, thoắt ẩn thoắt hiện. Damien nguy hiểm, nhưng lại nguyện trở thành chiếc khiên vững chắc nhất để che chở cho bạn khỏi những thế lực đen tối khác.',
      imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop',
      link: '#', 
      status: 'Hot' 
    },
    { 
      name: 'Ares', 
      desc: 'Chiến thần ngang tàn, ngạo nghễ, chỉ dịu dàng với duy nhất một mình bạn.', 
      fullDesc: 'Một chiến binh bất bại trên mọi chiến trường, Ares sở hữu sức mạnh vô song và tính cách kiêu ngạo. Hắn coi thường mọi luật lệ và thần linh, nhưng lại cam tâm tình nguyện quỳ gối trước mặt bạn, dâng lên ngọn lửa sinh mệnh của mình.',
      imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800&auto=format&fit=crop',
      link: '#', 
      status: 'Update' 
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCharacters = characters.filter((char) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const matchName = char.name.toLowerCase().includes(term);
    const matchDesc = char.desc.toLowerCase().includes(term);
    const matchFullDesc = char.fullDesc?.toLowerCase().includes(term);
    const matchTags = char.tags?.some((t: string) => t.toLowerCase().includes(term));
    return matchName || matchDesc || matchFullDesc || matchTags;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await addDoc(collection(db, 'feedbacks'), {
        message: feedback,
        createdAt: serverTimestamp()
      });
      setSubmitSuccess(true);
      setFeedback('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedbacks');
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url('/bg-portrait.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>
      <DustParticles />
      
      <div className="relative z-10">
        {/* Header / Thanh điều hướng */}
        <header className="border-b border-red-600/30 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <span className="text-2xl font-black tracking-widest text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">JanceD</span>
          <div className="space-x-6 text-sm font-semibold">
            <a href="#chars" className="hover:text-red-500 transition-colors">Characters</a>
            <a href="#feedback" className="hover:text-red-500 transition-colors">Feedback</a>
            <a href="#socials" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-all shadow-lg shadow-red-600/20">Socials</a>
          </div>
        </header>

        {/* Hero Section */}
        <section 
          className="text-center py-24 px-4 w-full relative bg-cover bg-center border-b border-red-900/30"
          style={{ backgroundImage: `url('/bg-landscape.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"></div>
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-bold italic font-serif tracking-wider mb-4 text-white lowercase drop-shadow-md">
              góc nhỏ của{" "}
              <span className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                janced
              </span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base drop-shadow-lg font-light lowercase flex items-center gap-2">
              <span className="text-white/60">✦</span>
              chào mừng bạn đến với nơi lưu trữ các ai bot sáng tạo ୨୧
              <span className="text-white/60">✦</span>
            </p>
          </div>
        </section>

        {/* Grid Nhân vật AI */}
        <section id="chars" className="py-12 px-6 max-w-5xl mx-auto scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-2xl font-bold border-l-4 border-red-600 pl-3 text-red-500">Danh Sách AI Bot</h3>
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm character, hashtag..."
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-red-600 text-white placeholder-zinc-500 text-sm rounded-full pl-10 pr-9 py-2.5 outline-none transition-all duration-200 focus:ring-1 focus:ring-red-600/50 backdrop-blur-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 transition-colors"
                  aria-label="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {filteredCharacters.length === 0 ? (
            <div className="text-center py-16 px-4 bg-zinc-950/60 border border-zinc-800/80 rounded-3xl backdrop-blur-sm">
              <p className="text-zinc-400 text-base mb-3">Không tìm thấy AI Bot nào phù hợp với "<span className="text-white font-medium">{searchTerm}</span>"</p>
              <button 
                onClick={() => setSearchTerm('')} 
                className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 font-medium underline transition-colors"
              >
                Xóa từ khóa tìm kiếm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {filteredCharacters.map((char, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  className="relative h-72 md:h-96 w-full rounded-2xl md:rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg hover:shadow-red-900/30 transition-all duration-300"
                  onClick={() => setSelectedChar(char)}
                >
                  <img 
                    src={char.imageUrl} 
                    alt={char.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-3 left-3 md:top-4 md:left-4">
                    <span className="text-[8px] md:text-[10px] uppercase tracking-wider bg-pink-900/40 text-pink-300 border border-pink-500/50 px-2 py-1 md:px-3 md:py-1.5 rounded-full font-bold backdrop-blur-sm">
                      {char.status === 'Hot' ? '🔥 HOT' : char.status === 'Update' ? '✨ NEW TRY' : char.status}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col justify-end">
                    <h3 className="text-lg md:text-2xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors drop-shadow-md">
                      {char.name}
                    </h3>
                    <p className="text-gray-300 text-xs md:text-sm mb-2 md:mb-3 italic line-clamp-2 drop-shadow-md">
                      {char.desc}
                    </p>
                    {char.tags && (
                      <p className="text-gray-400 text-[10px] md:text-xs line-clamp-1 drop-shadow-md">
                        {char.tags.map((t: string) => `#${t}`).join(' ')}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      {/* Modal chi tiết nhân vật */}
      <AnimatePresence>
        {selectedChar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto" 
            onClick={() => setSelectedChar(null)}
          >
            <motion.div 
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="bg-zinc-950 border border-red-900/40 rounded-2xl md:rounded-3xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl shadow-red-950/40 relative my-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Top Navigation Bar inside Modal */}
              <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedChar(null)}
                  className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-5 h-5 text-red-500" />
                  <div className="text-left leading-tight">
                    <p className="font-bold text-white text-sm line-clamp-1">{selectedChar.name}</p>
                    <p className="text-[10px] text-zinc-400 font-normal line-clamp-1">{selectedChar.desc}</p>
                  </div>
                </button>
                <button 
                  onClick={() => setSelectedChar(null)}
                  className="p-1.5 bg-zinc-900 hover:bg-red-600 text-zinc-400 hover:text-white rounded-full transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedChar.images && selectedChar.images.length > 0 ? (
                <div className="relative h-72 md:h-96 w-full bg-zinc-900 shrink-0 overflow-x-auto flex snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {selectedChar.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative w-full h-full shrink-0 snap-center">
                      <img src={img} alt={`${selectedChar.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative h-64 md:h-72 w-full bg-zinc-900 shrink-0">
                  <img src={selectedChar.imageUrl} alt={selectedChar.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                </div>
              )}
              
              <div className="p-5 md:p-7 overflow-y-auto space-y-5">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{selectedChar.name}</h3>
                    <span className="text-xs bg-red-950 text-red-400 border border-red-900/80 px-3 py-1 rounded-full font-bold shrink-0">{selectedChar.status}</span>
                  </div>
                  <p className="text-zinc-400 text-sm italic">{selectedChar.desc}</p>
                </div>

                {selectedChar.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedChar.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Primary CTA button like video */}
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={selectedChar.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl text-base font-bold bg-white text-black hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Chơi với {selectedChar.name}</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
                
                <div className="space-y-4 pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">MÔ TẢ</h4>
                    <p className="text-zinc-300 leading-relaxed text-sm bg-zinc-900/40 border border-zinc-800/60 p-3.5 rounded-xl">{selectedChar.fullDesc}</p>
                  </div>

                  {selectedChar.profile && (
                    <details className="group border border-zinc-800/80 rounded-xl bg-zinc-900/40 open:bg-zinc-900/70 transition-colors">
                      <summary className="font-bold text-sm text-zinc-200 cursor-pointer p-4 select-none flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                        HỒ SƠ NHÂN VẬT
                        <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-4 pb-4 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed border-t border-zinc-800/50 pt-3">
                        {selectedChar.profile}
                      </div>
                    </details>
                  )}
                  
                  {selectedChar.backstory && (
                    <details className="group border border-zinc-800/80 rounded-xl bg-zinc-900/40 open:bg-zinc-900/70 transition-colors">
                      <summary className="font-bold text-sm text-zinc-200 cursor-pointer p-4 select-none flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                        BACKSTORY
                        <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-4 pb-4 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed border-t border-zinc-800/50 pt-3">
                        {selectedChar.backstory}
                      </div>
                    </details>
                  )}

                  {selectedChar.worldBuilding && (
                    <details className="group border border-zinc-800/80 rounded-xl bg-zinc-900/40 open:bg-zinc-900/70 transition-colors">
                      <summary className="font-bold text-sm text-zinc-200 cursor-pointer p-4 select-none flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                        WORLD-BUILDING
                        <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-4 pb-4 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed border-t border-zinc-800/50 pt-3">
                        {selectedChar.worldBuilding}
                      </div>
                    </details>
                  )}
                  
                  {selectedChar.firstMess && (
                    <details className="group border border-zinc-800/80 rounded-xl bg-zinc-900/40 open:bg-zinc-900/70 transition-colors">
                      <summary className="font-bold text-sm text-zinc-200 cursor-pointer p-4 select-none flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                        FIRST MESS
                        <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-4 pb-4 text-zinc-300 text-sm whitespace-pre-wrap italic border-t border-zinc-800/50 pt-3 border-l-2 border-red-600/50 ml-2">
                        {selectedChar.firstMess}
                      </div>
                    </details>
                  )}
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => setSelectedChar(null)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors border border-zinc-800"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form phản hồi ẩn danh */}
      <section id="feedback" className="py-12 px-6 max-w-2xl mx-auto scroll-mt-20">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 shadow-2xl shadow-red-900/10">
          <h3 className="text-2xl font-bold text-center mb-2">Gửi Phản Hồi Ẩn Danh</h3>
          <p className="text-gray-400 text-xs text-center mb-6">Mọi ý kiến đóng góp hoặc gợi ý cốt truyện đều được tiếp nhận ẩn danh hoàn toàn.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              required
              rows={4}
              placeholder="Nhập lời nhắn của bạn tại đây..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-gray-600 text-sm"
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !feedback.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-600/20 transition-colors flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi phản hồi ẩn danh'
              )}
            </button>
            {submitSuccess && (
              <p className="text-green-500 text-sm text-center font-medium mt-2">
                Cảm ơn bạn! Phản hồi ẩn danh đã được gửi thành công.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer / Liên kết xã hội */}
      <footer id="socials" className="border-t border-zinc-900 bg-zinc-950 py-10 px-6 text-center text-gray-500 text-xs">
        <p className="mb-4">Theo dõi JanceD trên mạng xã hội</p>
        <div className="flex justify-center space-x-6 mb-6 text-sm">
          <a href="#" className="hover:text-red-500 transition-colors">Facebook</a>
          <a href="#" className="hover:text-red-500 transition-colors">TikTok</a>
          <a href="#" className="hover:text-red-500 transition-colors">GGAI Community</a>
        </div>
        <p>© 2026 JanceD. Phát triển dựa trên nền tảng Firebase.</p>
      </footer>

      {/* Background Music Player */}
      <audio 
        ref={audioRef} 
        src={songs[currentSongIndex].url} 
        preload="auto"
        onEnded={nextSong}
        onError={(e) => {
          const err = e.currentTarget.error;
          console.warn("Lỗi tải file âm thanh:", err ? (err.message || `Code ${err.code}`) : "Lỗi không xác định");
          setIsPlaying(false);
        }}
      />
      
      {/* Floating Buttons */}
      <div className="fixed bottom-6 z-40 w-full px-6 flex justify-between pointer-events-none">
        {/* Left side: Music Player Group */}
        <div className="pointer-events-auto flex items-end relative">
          {showPlaylist && (
            <div className="absolute bottom-14 left-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-2 w-48 animate-in slide-in-from-bottom-2 duration-300">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Danh sách phát</h4>
              <div className="space-y-1">
                {songs.map((song, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSongIndex(index);
                      setIsPlaying(true);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm truncate transition-colors ${index === currentSongIndex ? 'bg-red-500/20 text-red-400' : 'text-gray-300 hover:bg-zinc-800'}`}
                  >
                    {song.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showPlayer ? (
            <div className="bg-zinc-900 border border-zinc-700 rounded-full p-2 flex items-center gap-2 shadow-lg animate-in slide-in-from-left duration-300">
              <button 
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`px-3 text-xs font-medium max-w-[100px] truncate border-r border-zinc-700 transition-colors ${showPlaylist ? 'text-red-400' : 'text-white/80 hover:text-white'}`}
              >
                {songs[currentSongIndex].title}
              </button>
              <button onClick={prevSong} className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={togglePlay} className="p-2 text-red-500 hover:text-red-400 hover:bg-zinc-800 rounded-full transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={stopSong} className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                <Square className="w-4 h-4" />
              </button>
              <button onClick={nextSong} className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <div className="w-[1px] h-6 bg-zinc-700 mx-1"></div>
              <button onClick={() => {
                setShowPlayer(false);
                setShowPlaylist(false);
              }} className="p-2 text-gray-500 hover:text-white rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowPlayer(true)}
              className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-700 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all focus:outline-none"
              title="Mở trình phát nhạc"
            >
              {isPlaying ? <Music className="w-5 h-5 text-red-500 animate-pulse" /> : <Music className="w-5 h-5 text-gray-400" />}
            </button>
          )}
        </div>

        {/* Right side: Scroll to Top */}
        <div className="pointer-events-auto flex flex-col items-center justify-end">
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-700 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all focus:outline-none mb-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
              title="Scroll to Top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
