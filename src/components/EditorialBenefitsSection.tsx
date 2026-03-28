/**
 * plan.md PR 11 — three-column value proposition (Thai copy) between trust bar
 * and deeper homepage modules.
 */
const BENEFITS: readonly {
  readonly heading: string;
  readonly body: string;
  readonly icon: 'bolt' | 'layers' | 'device';
}[] = [
  {
    heading: 'ข่าวเร็ว',
    body: 'สรุปประเด็นสำคัญแบบอ่านจบในไม่กี่นาที เหมาะกับช่วงเช้าก่อนเริ่มวัน',
    icon: 'bolt',
  },
  {
    heading: 'วิเคราะห์ลึก',
    body: 'เชื่อมบริบทและแหล่งข่าวต้นทาง เวลาที่หัวข้อต้องเข้าใจมากกว่าพาดหัว',
    icon: 'layers',
  },
  {
    heading: 'อ่านได้ทุกที่',
    body: 'จัดวางให้อ่านบนมือถือก่อน โฟกัสที่อ่านต่อเนื่อง ไม่ใช่แค่คลิกวนไปมา',
    icon: 'device',
  },
];

function BenefitIcon({ variant }: { variant: 'bolt' | 'layers' | 'device' }) {
  const common = 'w-10 h-10 text-red-400';
  if (variant === 'bolt') {
    return (
      <svg className={common} viewBox='0 0 24 24' fill='none' aria-hidden>
        <path
          d='M13 2L4 14h7l-1 8 10-12h-7l0-8z'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinejoin='round'
        />
      </svg>
    );
  }
  if (variant === 'layers') {
    return (
      <svg className={common} viewBox='0 0 24 24' fill='none' aria-hidden>
        <path
          d='M12 4L4 8l8 4 8-4-8-4zm-8 8l8 4 8-4M4 16l8 4 8-4'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox='0 0 24 24' fill='none' aria-hidden>
      <rect
        x='6'
        y='3'
        width='12'
        height='18'
        rx='2'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path d='M9 18h6' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  );
}

export function EditorialBenefitsSection() {
  return (
    <section
      className='mt-6 surface-panel p-5 sm:p-6 md:p-8'
      aria-labelledby='editorial-benefits-heading'
    >
      <h2
        id='editorial-benefits-heading'
        className='text-white text-lg sm:text-xl font-extrabold text-center'
      >
        ทำไมถึงอ่านที่นี่
      </h2>
      <ul className='mt-5 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6'>
        {BENEFITS.map((item) => (
          <li
            key={item.heading}
            className='flex flex-col items-center text-center rounded-xl border border-white/20 bg-black/15 px-4 py-5'
          >
            <BenefitIcon variant={item.icon} />
            <h3 className='mt-3 text-white font-extrabold text-base sm:text-lg'>
              {item.heading}
            </h3>
            <p className='mt-2 text-white/85 text-sm sm:text-base leading-relaxed'>
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
