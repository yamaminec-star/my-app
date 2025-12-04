import json
import os
import sys
from pathlib import Path

def main():
    # 環境変数から設定を取得
    target_folders_str = os.environ.get('TARGET_FOLDERS', 'images,uploads')
    json_filename = os.environ.get('JSON_FILENAME', 'files.json')
    
    target_dirs = [folder.strip() for folder in target_folders_str.split(',')]
    
    print(f"📋 使用するJSONファイル名: {json_filename}")
    print(f"📁 対象フォルダ: {', '.join(target_dirs)}")
    print("=" * 60)
    
    total_deleted = 0
    
    # 各対象フォルダをチェック
    for target_dir in target_dirs:
        dir_path = Path(target_dir)
        
        print(f"\n{'='*60}")
        print(f"📁 処理中: {target_dir}")
        
        if not dir_path.exists():
            print(f"❌ フォルダが存在しません: {target_dir}")
            print(f"   現在のディレクトリ: {Path.cwd()}")
            print(f"   存在するフォルダ:")
            for item in Path('.').iterdir():
                if item.is_dir():
                    print(f"     - {item.name}")
            continue
        
        print(f"✅ フォルダが存在します")
        
        # 指定されたJSON名でファイルを読み込み
        json_file = dir_path / json_filename
        
        if not json_file.exists():
            print(f"❌ JSONファイルが存在しません: {json_file}")
            print(f"   {target_dir}フォルダ内のファイル:")
            for item in dir_path.iterdir():
                print(f"     - {item.name}")
            continue
        
        print(f"✅ JSONファイルが存在します: {json_file}")
        
        # JSONから有効なファイルリストを読み込み
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                valid_files = set(data['files'])
                print(f"📄 JSON内容:")
                print(f"   保持するファイル: {valid_files}")
        except Exception as e:
            print(f"❌ JSONの読み込みエラー: {e}")
            continue
        
        # フォルダ内の実際のファイルを表示
        print(f"\n📂 {target_dir}フォルダ内の全ファイル:")
        all_files = []
        for file_path in dir_path.iterdir():
            if file_path.is_file():
                all_files.append(file_path.name)
                print(f"   - {file_path.name}")
        
        if not all_files:
            print(f"   (ファイルなし)")
        
        files_to_delete = []
        
        print(f"\n🔍 削除判定:")
        # フォルダ内のファイルをチェック
        for file_path in dir_path.iterdir():
            if file_path.is_file() and file_path.name != json_filename:
                if file_path.name not in valid_files:
                    files_to_delete.append(file_path)
                    print(f"   ❌ 削除対象: {file_path.name}")
                else:
                    print(f"   ✅ 保持: {file_path.name}")
        
        # 削除実行
        if files_to_delete:
            print(f"\n🗑️ 削除実行:")
            for f in files_to_delete:
                print(f"   削除中: {f.name}")
                f.unlink()
                print(f"   ✓ 削除完了: {f.name}")
            print(f"\n✅ {len(files_to_delete)} 個のファイルを削除しました")
            total_deleted += len(files_to_delete)
        else:
            print(f"\n✅ 削除対象のファイルはありません")
    
    print(f"\n{'='*60}")
    print(f"🎯 最終結果: 合計 {total_deleted} 個のファイルを削除しました")
    print(f"{'='*60}")
    
    return total_deleted

if __name__ == '__main__':
    main()
