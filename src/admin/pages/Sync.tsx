// PLUS 동기화 (A-06-01): PLUS에서 상품 정보를 주기적으로 받아 온다. 실패하면 마지막 성공 데이터를 쓴다
import { SyncOutlined } from '@ant-design/icons';
import { App, Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { dtA } from '@/shared/lib';
import { type SyncLog, useDB } from '@/shared/api';
import { ListBox, PageHead, StatusTag, tableProps } from '@/shared/ui/admin';
import s from './catalog.module.css';

export default function Sync() {
  const log = useDB(x => x.syncLog);
  const sync = useDB(x => x.sync);
  const { message } = App.useApp();
  const last = log.find(x => x.ok), fails = log.filter(x => !x.ok).length;

  const run = () => {
    sync();
    message.success(`PLUS에서 상품 ${useDB.getState().syncLog[0].n ?? 0}개를 다시 받았어요`);
  };

  const columns: ColumnsType<SyncLog> = [
    { title: '실행 시각', render: (_, x) => <span className="num">{dtA(x.at)}</span> },
    { title: '방식', dataIndex: 'how' },
    { title: '결과', render: (_, x) => (x.ok ? <StatusTag kind="ok">성공</StatusTag> : <StatusTag kind="cancel">실패</StatusTag>) },
    { title: '내용', render: (_, x) => (x.ok ? `상품 ${x.n ?? 0}개 받음` : x.err) },
  ];

  return (
    <>
      <PageHead title="PLUS 동기화" id="A-06-01" desc="PLUS에서 상품 정보를 주기적으로 받아 와요. 실패하면 마지막 성공 데이터를 그대로 써요." />
      <div className={`a-kpis ${s.kpis3}`}>
        <div className="a-kpi"><span className="k">마지막 성공</span><span className="v num">{last ? dtA(last.at) : '-'}</span><span className="d">{last ? `상품 ${last.n ?? 0}개 받음` : '아직 성공한 기록이 없어요'}</span></div>
        <div className="a-kpi"><span className="k">실행 주기</span><span className="v">3시간마다</span><span className="d">자동으로 실행해요. 필요하면 바로 수동 실행할 수 있어요</span></div>
        <div className="a-kpi"><span className="k">실패 기록</span><span className="v num">{fails}건</span><span className="d">실패하면 판매 현황의 운영 알림에 보여요</span></div>
      </div>
      <ListBox title="실행 기록" total={log.length} extra={<Button type="primary" icon={<SyncOutlined />} onClick={run}>수동 실행</Button>}>
        <Table {...tableProps} rowKey={x => `${x.at}${x.how}`} columns={columns} dataSource={log} rowClassName={x => (x.ok ? '' : 'row-warn')} />
      </ListBox>
    </>
  );
}
