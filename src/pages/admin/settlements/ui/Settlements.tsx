// 월별 정산 (A-04-01): 매월 1일에 지난달 정산 내역을 만들고 PLUS 발급 기록과 맞춰 본다
import { ReloadOutlined } from '@ant-design/icons';
import { App, Button, Table, type TableColumnsType } from 'antd';
import { useNavigate } from 'react-router-dom';
import { type SettleMonth, settleMonths, settleTag } from '@/entities/settlement';
import { won } from '@/shared/lib';
import { useDB } from '@/shared/api';
import { ListBox, PageHead, StatusTag, tableProps } from '@/shared/ui/admin';
import { settleRun } from '../model/settleRun';

export default function Settlements() {
  const db = useDB();
  const nav = useNavigate();
  const { message } = App.useApp();
  const months = settleMonths(db);
  const cur = months[0], last = months[1];
  // 수동 실행 시각은 ISO로 저장돼 있어 관리자 표기로 바꾼다

  const columns: TableColumnsType<SettleMonth> = [
    { title: '정산 월', dataIndex: 'label' },
    { title: '상태', dataIndex: 'st', render: (v: SettleMonth['st']) => <StatusTag kind={settleTag(v)}>{v}</StatusTag> },
    { title: '발급', dataIndex: 'n', align: 'right', render: (v: number) => `${v.toLocaleString()}장` },
    { title: '점주 지급액', dataIndex: 'amt', align: 'right', render: (v: number) => won(v) },
    { title: '생성', key: 'at', dataIndex: 'at' },
    {
      title: '동작', key: 'act', render: (_, m) => (
        <Button size="small" onClick={() => (m.key === last.key ? nav(`/admin/settlements/${m.key}`) : message.info(m.key === cur.key ? '이번 달은 아직 집계 중이에요. 상세 내역은 지난달 정산만 볼 수 있어요' : '상세 내역은 지난달 정산만 볼 수 있어요'))}>상세</Button>
      ),
    },
  ];

  return (
    <>
      <PageHead title="월별 정산" id="A-04-01" desc="매월 1일에 지난달 정산 내역을 자동으로 만들고 PLUS 발급 기록과 맞춰 봐요. 정산 상대는 점주이고, 점주 지급액은 판매가에서 판매수수료를 뺀 금액이에요." />
      <ListBox total={months.length} extra={<Button icon={<ReloadOutlined />} onClick={() => { settleRun(); message.success(`${cur.label} 정산 내역을 다시 만들었어요. PLUS와 대조를 시작해요`); }}>수동 실행</Button>}>
        <Table<SettleMonth> {...tableProps} rowKey="key" columns={columns} dataSource={months} />
      </ListBox>
    </>
  );
}
