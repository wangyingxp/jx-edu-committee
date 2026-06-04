// 种子数据 - 初始化教工委网站的首批新闻
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '新闻动态',
    content TEXT NOT NULL,
    summary TEXT,
    cover_image TEXT,
    is_published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'jxedu2026');
}

const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get();
if (newsCount.count === 0) {
  const insert = db.prepare(
    'INSERT INTO news (title, category, content, summary, created_at) VALUES (?, ?, ?, ?, ?)'
  );

  const articles = [
    {
      title: '上海江西商会教工委正式启动试运营',
      category: '新闻动态',
      summary: '2026年4月，上海江西商会教育服务工作委员会（教工委）正式启动为期6个月的试运营，面向商会内部邀请首批种子会员家庭参与。',
      content: `<p>2026年4月，上海江西商会教育服务工作委员会（以下简称"教工委"）正式启动试运营。试运营周期为2026年4月至9月，为期6个月。</p>
<h3>试运营三个阶段</h3>
<p><strong>启动阶段：</strong>面向上海江西商会内部，邀请首批种子会员家庭参与；建立教工委试运营公众号和社群，启动基础运营与信息支持；构建管理层人员、执行层人员、顾问委员会人员以及意向理事单位。</p>
<p><strong>运行与验证阶段：</strong>在试运营过程中，试验修改教育资源甄选与合作机制；围绕关键学段与时间节点，组织少量主题交流与支持活动；验证教工委在信息筛选、资源协调与会员服务方面的实际成效。</p>
<p><strong>评估阶段：</strong>对参与情况、会员反馈及运行成本进行阶段性评估；形成书面总结，提交商会作为是否进入正式运行阶段的重要依据。</p>
<p>教工委的设立，不仅是商会在会员服务体系中的重要补充，更是沪赣两地教育与人才交流的重要桥梁。我们期待与各位会员家庭携手，共同打造一个专业、可靠、可持续的教育支持平台。</p>`,
      created_at: '2026-04-01 10:00:00'
    },
    {
      title: '教工委组织架构正式发布',
      category: '公告通知',
      summary: '教工委公布完整的组织管理架构，包括战略指导层、管理层、执行层和专业支持层四个层级，确保规范运行。',
      content: `<p>为确保教工委规范、高效运行，经商会研究决定，现正式发布教工委组织管理架构。</p>
<h3>四层架构体系</h3>
<p><strong>战略指导层：</strong>由商会核心领导担任，设荣誉会长1名（商会会长）、总顾问4名（商会执行会长+秘书长）、监事长1名（商会监事长）。不负责日常运营，提供最高层面的全面指导与资源背书。</p>
<p><strong>管理层：</strong>设主任1名、副主任若干名。主任为教工委总负责人，副主任分管基础教育、国际教育、综合服务、活动运营等不同领域。</p>
<p><strong>执行层：</strong>设秘书处和运营部。秘书长由教工委主任任命，负责日常事务协调推进；运营部负责活动策划执行、供应商管理等具体工作。</p>
<p><strong>专业支持层：</strong>设顾问委员会和理事单位。顾问委员会由教育专家顾问团及各领域专家构成；理事单位通过严格评审加入，为会员提供优质教育资源。</p>
<p>各层级职责明确、协同运作，确保教工委各项工作有序推进。</p>`,
      created_at: '2026-04-10 14:00:00'
    },
    {
      title: '沪赣教育发展高峰论坛筹备工作启动',
      category: '活动预告',
      summary: '教工委计划于2026年下半年举办首届沪赣教育发展高峰论坛，届时邀请两地专家、政府部门及学校代表参会。',
      content: `<p>为响应江西省人才战略与教育强市建设目标，推动沪赣两地教育资源协同与人才双向流动，教工委正式启动首届"沪赣教育发展高峰论坛"筹备工作。</p>
<h3>论坛定位</h3>
<p>论坛将围绕教育高质量发展、产教融合、人才培养等主题，邀请沪赣两地教育专家、政府相关部门负责人、学校及企业代表参会研讨，打造沪赣教育交流品牌活动。</p>
<h3>预期成果</h3>
<ul>
<li>搭建沪赣两地教育常态化交流平台</li>
<li>推动校校结对共建、师资双向交流等合作项目落地</li>
<li>发布沪赣教育资源与人才供需信息库</li>
<li>形成可复制、可推广的跨区域教育协同发展模式</li>
</ul>
<p>论坛具体时间和议程将在后续公告中发布，敬请关注。</p>`,
      created_at: '2026-05-15 09:00:00'
    },
    {
      title: '教工委理事单位招募公告',
      category: '公告通知',
      summary: '教工委面向上海江西商会会员招募首批理事单位，入选者将获得为会员提供教育服务的资格和平台资源支持。',
      content: `<p>为进一步丰富教工委教育服务资源体系，现面向上海江西商会全体会员招募首批理事单位。</p>
<h3>入选标准</h3>
<ul>
<li><strong>基本条件：</strong>上海江西商会正式会员，或教工委主任特别邀请的外部优质资源方</li>
<li><strong>专业背景：</strong>教育行业从业者或拥有优质教育资源者优先</li>
<li><strong>贡献意愿：</strong>愿意为教工委提供资源支持或专业服务</li>
<li><strong>信誉要求：</strong>无不良商业记录，在商会内有良好口碑</li>
<li><strong>赞助承诺：</strong>同意缴纳理事赞助费（每年1万元，初期可先缴5000元）</li>
</ul>
<h3>筛选流程</h3>
<p>初审（秘书处核实资质）→ 评审（管理层表决）→ 公示（商会内部及公众号公示）→ 聘任（主任颁发聘书）</p>
<h3>退出机制</h3>
<p>累计3次有效投诉、对商会造成重大负面影响、连续3次未参加理事会会议或未缴纳赞助费、利用教工委名义进行违规商业活动的，将取消理事资格。</p>
<p>有意向的会员请联系教工委秘书处报名。</p>`,
      created_at: '2026-05-20 16:00:00'
    },
    {
      title: '首场教育主题沙龙圆满举办',
      category: '新闻动态',
      summary: '教工委成功举办首场线下教育主题沙龙，聚焦"小升初路径规划与择校策略"，20余位会员家庭到场参与交流。',
      content: `<p>近日，教工委成功举办首场线下教育主题沙龙活动，聚焦"小升初路径规划与择校策略"这一会员家庭普遍关注的话题。</p>
<h3>活动亮点</h3>
<p>本次活动特邀2位资深教育专家进行主题分享，围绕上海小升初政策变化、择校逻辑、关键时间节点等核心内容进行深入解读。20余位会员家庭到场参与，现场交流气氛热烈。</p>
<h3>专家观点</h3>
<p>专家指出，小升初是孩子教育路径中的第一个重要分水岭。家长需要理性看待"名校情结"，从孩子的实际学习能力、兴趣特长和家庭条件出发，选择最适合的升学路径，而非盲目追求所谓的"最好"学校。</p>
<h3>后续安排</h3>
<p>教工委计划按季度组织线下沙龙，覆盖不同学段的关键议题。下一场活动将聚焦中考政策解读与备考策略，敬请期待。</p>
<p>活动详细纪要将通过教工委公众号发布。</p>`,
      created_at: '2026-05-28 11:00:00'
    },
    {
      title: '教工委资金托管机制说明',
      category: '公告通知',
      summary: '教工委正式推出教育服务资金托管机制，类似支付宝担保交易模式，确保会员权益和服务质量。',
      content: `<p>为保障会员权益、规范教育服务交易流程，教工委正式推出资金托管机制。</p>
<h3>托管规则</h3>
<ul>
<li><strong>短期服务（≤3个月）：</strong>全额托管，会员确认服务完成后支付给服务方</li>
<li><strong>中期服务（3-6个月）：</strong>分期托管，按服务节点支付</li>
<li><strong>长期服务（>6个月）：</strong>可提前支付最多50%，余款托管</li>
</ul>
<h3>托管流程</h3>
<ol>
<li>会员将费用支付至商会指定托管账户</li>
<li>秘书处确认收款后通知服务方开始服务</li>
<li>服务完成后会员确认验收</li>
<li>秘书处扣除监管服务费后支付给服务方</li>
</ol>
<h3>监管服务费</h3>
<p>教工委从每笔交易中收取交易金额5%作为监管服务费（由服务提供方支出），用于教工委日常运营。这一机制确保了教工委的非营利可持续运转，同时也为会员提供了类似支付宝的安全交易保障。</p>`,
      created_at: '2026-06-01 08:00:00'
    }
  ];

  const insertMany = db.transaction((articles) => {
    for (const a of articles) {
      insert.run(a.title, a.category, a.content, a.summary, a.created_at);
    }
  });

  insertMany(articles);
  console.log(`已插入 ${articles.length} 篇种子新闻`);
} else {
  console.log(`数据库已有 ${newsCount.count} 篇新闻，跳过种子数据`);
}

db.close();
